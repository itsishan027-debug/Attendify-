const { EmbedBuilder } = require("discord.js");
const { data, saveData, ensureUser } = require("./data");

function format(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function time(ts) {
  return `<t:${Math.floor(ts / 1000)}:t>`;
}

async function handleOnline(userId, reply) {
  ensureUser(userId);

  if (data[userId].start)
    return reply("You are already online.", true);

  data[userId].start = Date.now();
  data[userId].lastSeen = Date.now();
  saveData();

  return reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Green")
        .setDescription(`🟢 <@${userId}> is now **ONLINE**`)
        .setTimestamp()
    ]
  });
}

async function handleOffline(userId, reply) {
  ensureUser(userId);

  if (!data[userId].start)
    return reply("You are not online.", true);

  const end = Date.now();
  const duration = end - data[userId].start;

  data[userId].total += duration;
  data[userId].sessions.push({
    start: data[userId].start,
    end,
    duration
  });

  data[userId].start = null;
  saveData();

  return reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Red")
        .setDescription(
          `🔴 <@${userId}> is now **OFFLINE**\n\n` +
          `🟢 Online: ${time(data[userId].sessions.at(-1).start)}\n` +
          `🔴 Offline: ${time(end)}\n` +
          `⏱ Duration: ${format(duration)}`
        )
        .setTimestamp()
    ]
  });
}

async function handleStatus(userId, reply) {
  ensureUser(userId);

  return reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Blue")
        .setTitle("📊 Attendance Status")
        .setDescription(
          `Total Time: ${format(data[userId].total)}\n` +
          `Currently Online: ${data[userId].start ? "Yes" : "No"}`
        )
        .setTimestamp()
    ]
  });
}

async function handleHistory(userId, reply) {
  ensureUser(userId);

  const sessions = data[userId].sessions.slice(-5).reverse();
  if (!sessions.length)
    return reply("No attendance history found.", true);

  const desc = sessions.map((s, i) =>
    `**${i + 1}.** 🟢 ${time(s.start)} → 🔴 ${time(s.end)} | ${format(s.duration)}`
  ).join("\n");

  return reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Purple")
        .setTitle("🕒 Attendance History")
        .setDescription(desc)
        .setTimestamp()
    ]
  });
}

module.exports = {
  handleOnline,
  handleOffline,
  handleStatus,
  handleHistory
};
