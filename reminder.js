const { EmbedBuilder } = require("discord.js");

const starters = ["Still offline?", "Oh wow,", "Look who’s missing,", "Attendance check failed!", "System alert:", "Breaking news:", "Attendance police here,", "Server report says,", "Guess what?", "Apparently,"];
const middles = ["even bots are more active than you", "your login button is on vacation", "you’ve mastered ghost mode", "your WiFi abandoned you", "you’re in professional AFK mode", "you’re farming offline hours", "you’re buffering in real life", "your attendance expired", "you’re practicing invisibility", "your motivation left you"];
const endings = ["log in before we forget you.", "attendance is crying.", "clan is disappointed.", "this is embarrassing.", "this is not a vacation.", "wake up soldier.", "stop being invisible.", "report immediately.", "login required ASAP.", "don’t make it worse."];

function generateSavageMessage() {
  const s = starters[Math.floor(Math.random() * starters.length)];
  const m = middles[Math.floor(Math.random() * middles.length)];
  const e = endings[Math.floor(Math.random() * endings.length)];
  return `${s} ${m} — ${e}`;
}

// Ye function ab sirf manual commands ke liye use hoga
function getReminderEmbed(userId) {
  return new EmbedBuilder()
    .setColor("#ff0000")
    .setTitle("🚨 ATTENDANCE BOT")
    .setDescription(`<@${userId}> ${generateSavageMessage()}`)
    .setFooter({ text: "Manual Reminder System" })
    .setTimestamp();
}

// Automatic function ko khali kar diya taaki error na aaye
function startReminder(client) {
  console.log("ℹ️ Automatic reminders are DISABLED. Only manual reminders active.");
}

module.exports = { startReminder, getReminderEmbed };
