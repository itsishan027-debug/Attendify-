const { EmbedBuilder } = require("discord.js");
const { data, saveData, ensureUser } = require("./data");
const config = require("./config");

function formatDuration(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

async function handleOnline(member, reply) {
  const userId = member.id;
  ensureUser(userId);
  if (data.users[userId].start) return reply({ content: "⚠️ You are already ONLINE.", ephemeral: true });

  data.users[userId].start = Date.now();
  data.users[userId].lastSeen = Date.now();
  saveData();

  let desc = `✅ **<@${userId}>** has started their session.`;
  let color = "#2ecc71";
  let title = "Status: ONLINE";

  // Hierarchy Logic
  if (userId === config.SUPREME_LEADER_ID) {
    title = "👑 THE SUPREME LEADER";
    desc = `⚡ **All hail <@${userId}>!** The ultimate authority is now monitoring the frontlines. ⚡`;
    color = "#ff0000";
  } else if (member.roles.cache.has(config.LEADER_ROLE_ID)) {
    desc = `🛡️ Leader **<@${userId}>** is watching.`;
    color = "#f1c40f";
  } else if (member.roles.cache.has(config.EXECUTIVE_ROLE_ID)) {
    desc = `🚨 **Angry Bird Alert!** Vigilance at peak. <@${userId}> is active.`;
    color = "#3498db";
  } else {
    // Check Custom Slots
    for (const slot of data.settings.customSlots) {
      if (slot.roleId && member.roles.cache.has(slot.roleId)) {
        desc = slot.msg.replace("{user}", `<@${userId}>`);
        break;
      }
    }
  }

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
    .setDescription(desc)
    .addFields({ name: "Login Time", value: `<t:${Math.floor(Date.now() / 1000)}:t>` })
    .setTimestamp();

  return reply({ embeds: [embed] });
}

async function handleOffline(member, reply, isRestart = false) {
  const userId = member.id;
  ensureUser(userId);
  if (!data.users[userId].start) return !isRestart ? reply({ content: "⚠️ You are not ONLINE.", ephemeral: true }) : null;

  const end = Date.now();
  const duration = end - data.users[userId].start;
  data.users[userId].total += duration;
  data.users[userId].sessions.push({ start: data.users[userId].start, end, duration });
  data.users[userId].start = null;
  saveData();

  const embed = new EmbedBuilder()
    .setTitle(isRestart ? "🔄 RESTART SAVED" : "Status: OFFLINE")
    .setColor("#7f8c8d")
    .setDescription(userId === config.SUPREME_LEADER_ID ? `🌑 **The Supreme Leader** has departed.` : `🔴 **<@${userId}>** session ended.`)
    .addFields({ name: "Session Length", value: `\`${formatDuration(duration)}\`` })
    .setTimestamp();

  return reply({ embeds: [embed] });
}

async function forceOfflineAll(client) {
  const channel = await client.channels.fetch(config.TARGET_CHANNEL_ID);
  const guild = await client.guilds.fetch(config.TARGET_SERVER_ID);
  for (const id in data.users) {
    if (data.users[id].start) {
      try {
        const m = await guild.members.fetch(id);
        await handleOffline(m, (opt) => channel.send(opt), true);
      } catch (e) {
        data.users[id].start = null;
      }
    }
  }
  saveData();
}

module.exports = { handleOnline, handleOffline, forceOfflineAll };
