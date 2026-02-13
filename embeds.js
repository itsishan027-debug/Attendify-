const { EmbedBuilder } = require("discord.js");

const starters = [
"Still offline?",
"Oh wow",
"Look who’s missing again",
"Attendance check failed",
"Clan noticed something",
"System alert",
"Breaking news",
"Attendance police here",
"Server report says",
"Guess what",
"So umm",
"Apparently",
"Rumour has it",
"Update:",
"Sad news",
"Interesting",
"Plot twist",
"Imagine this",
"Legend says",
"Scientists confirmed"
];

const middles = [
"even bots are more active than you",
"your login button is on vacation",
"you’re dodging attendance again",
"you’ve mastered ghost mode",
"your WiFi abandoned you",
"you’re in professional AFK mode",
"your presence is missing",
"you’re farming offline hours",
"your activity is fictional",
"you think this is optional",
"you rage quit reality",
"you’re buffering in real life",
"your attendance expired",
"you’re practicing invisibility",
"your motivation left you",
"you’re hiding from responsibility",
"you’re on sleep duty",
"your online status is shy",
"your login needs motivation",
"your existence is lagging"
];

const endings = [
"log in before we forget you",
"attendance is crying",
"clan is disappointed",
"this is embarrassing",
"this is not a vacation",
"wake up soldier",
"stop being invisible",
"report immediately",
"do something useful",
"login required ASAP",
"we noticed everything",
"join now please",
"attendance is watching",
"get online now",
"this is your warning",
"fix this immediately",
"you’re officially absent",
"clan deserves better",
"don’t make it worse",
"we expected nothing but still"
];

function generateTaunt() {

  const s = starters[Math.floor(Math.random()*starters.length)];
  const m = middles[Math.floor(Math.random()*middles.length)];
  const e = endings[Math.floor(Math.random()*endings.length)];

  return `${s}, ${m} — ${e}.`;
}

function getRandomEmbed(userId) {

  return new EmbedBuilder()
    .setColor("#ff0000")
    .setTitle("🚨 ATTENDANCE POLICE")
    .setDescription(`<@${userId}> ${generateTaunt()}`)
    .setFooter({ text: "Attendify Savage Reminder System" })
    .setTimestamp();

}

module.exports = { getRandomEmbed };