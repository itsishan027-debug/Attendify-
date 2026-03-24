const { data } = require("./data");
const { EmbedBuilder } = require("discord.js");
const config = require("./config");

const starters = ["Still offline?", "Oh wow,", "Look who’s missing,", "Attendance check failed!", "System alert:", "Breaking news:", "Attendance police here,", "Server report says,", "Guess what?", "Apparently,"];
const middles = ["even bots are more active than you", "your login button is on vacation", "you’ve mastered ghost mode", "your WiFi abandoned you", "you’re in professional AFK mode", "you’re farming offline hours", "you’re buffering in real life", "your attendance expired", "you’re practicing invisibility", "your motivation left you"];
const endings = ["log in before we forget you.", "attendance is crying.", "clan is disappointed.", "this is embarrassing.", "this is not a vacation.", "wake up soldier.", "stop being invisible.", "report immediately.", "login required ASAP.", "don’t make it worse."];

function generateSavageMessage() {
  const s = starters[Math.floor(Math.random() * starters.length)];
  const m = middles[Math.floor(Math.random() * middles.length)];
  const e = endings[Math.floor(Math.random() * endings.length)];
  return `${s} ${m} — ${e}`;
}

function getReminderEmbed(userId) {
  return new EmbedBuilder()
    .setColor("#ff0000")
    .setTitle("🚨 ATTENDANCE POLICE")
    .setDescription(`<@${userId}> ${generateSavageMessage()}`)
    .setFooter({ text: "Aries Savage Reminder System" })
    .setTimestamp();
}

function startReminder(client) {
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() !== data.settings.reminderHour || now.getMinutes() !== 0) return;
    if (!data.settings.reminderEnabled) return;

    const channel = await client.channels.fetch(config.TARGET_CHANNEL_ID);
    const guild = await client.guilds.fetch(config.TARGET_SERVER_ID);
    await guild.members.fetch();

    const todayStart = new Date().setHours(0, 0, 0, 0);
    guild.members.cache.forEach(m => {
      if (m.user.bot) return;
      const u = data.users[m.id];
      if (!u || !u.lastSeen || u.lastSeen < todayStart) {
        channel.send({ content: `<@${m.id}>`, embeds: [getReminderEmbed(m.id)] });
      }
    });
  }, 60000);
}

module.exports = { startReminder, getReminderEmbed };
