const { data } = require("./data");
const { REMINDER_ENABLED, REMINDER_HOUR } = require("./config");
const { EmbedBuilder } = require("discord.js");

const REMINDER_MESSAGES = [
"🥺 {user}, I kinda miss you… a lot actually.",
"💭 {user}, feels weird not talking to you today.",
"😔 {user}, my day feels incomplete without you.",
"❤️ {user}, I miss you more than I should.",
"😞 {user}, why does everything remind me of you?",
"📱 {user}, I keep checking my phone, hoping it’s you.",
"🌙 {user}, missing you hits different at night.",
"🤍 {user}, I wish you were here right now.",
"💔 {user}, not talking to you feels heavy today.",
"🥀 {user}, I miss us… just saying.",
"😏 {user}, wow… so busy you forgot me?",
"😌 {user}, guess I’m not on today’s priority list.",
"😒 {user}, online but still no message… impressive.",
"😜 {user}, must be fun ignoring me.",
"😏 {user}, took you long enough to disappear.",
"👻 {user}, am I invisible today or what?",
"😌 {user}, busy with everyone except me?",
"😒 {user}, I see how it is now.",
"😂 {user}, should I book an appointment to talk to you?",
"😜 {user}, don’t worry, I’ll wait… like always.",
"💕 {user}, just wanted to check if you’re okay.",
"😊 {user}, hope your day is going well.",
"🤗 {user}, thinking of you and smiling.",
"❤️ {user}, take care, okay?",
"🍽️ {user}, I hope you’re eating properly.",
"😄 {user}, your smile crossed my mind today.",
"🌸 {user}, hope life is being kind to you.",
"💌 {user}, just sending some love your way.",
"💭 {user}, you crossed my thoughts randomly.",
"🤍 {user}, hope today treats you gently.",
"💔 {user}, some days feel heavier without you.",
"😞 {user}, I miss the comfort of talking to you.",
"🥺 {user}, not hearing from you hurts more than I admit.",
"🌙 {user}, I wish things were simpler between us.",
"💭 {user}, I miss the way you used to care.",
"💔 {user}, silence from you feels loud.",
"😔 {user}, I still wait for your message.",
"😢 {user}, I don’t say it often, but I miss you.",
"🥀 {user}, some connections don’t fade easily.",
"😞 {user}, you still matter to me, you know.",
"🥹 {user}, missing you with no reason at all.",
"❤️ {user}, I wish you knew how much I miss you.",
"😌 {user}, even busy days remind me of you.",
"💕 {user}, my heart lowkey waits for you.",
"😔 {user}, I miss the old you… and us.",
"🌸 {user}, talking to you used to be my comfort.",
"💭 {user}, I hope you think of me sometimes.",
"🤍 {user}, I’m here… even if you’re not.",
"🥀 {user}, missing you quietly.",
"❤️ {user}, just felt like saying—I miss you."
];

function getRandomEmbed(id) {

  const msg =
    REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)]
    .replace("{user}", `<@${id}>`);

  const colors = [0x5865F2, 0x57F287, 0xFEE75C, 0xED4245, 0xEB459E];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return new EmbedBuilder()
    .setTitle("🔔 Reminder")
    .setDescription(msg)
    .setColor(randomColor)
    .setFooter({ text: "Attendify System" })
    .setTimestamp();
}

function startReminder(client, SERVER_ID, CHANNEL_ID) {

  setInterval(async () => {

    if (!REMINDER_ENABLED) return;

    const now = new Date();
    if (now.getHours() !== REMINDER_HOUR || now.getMinutes() !== 0) return;

    const guild = client.guilds.cache.get(SERVER_ID);
    const channel = guild?.channels.cache.get(CHANNEL_ID);
    if (!channel) return;

    await channel.guild.members.fetch();

    const today = new Date();
    today.setHours(0,0,0,0);

    channel.members.forEach(member => {
      if (member.user.bot) return;

      const r = data.users?.[member.id];

      if (!r || !r.lastSeen || r.lastSeen < today.getTime()) {
        channel.send({ embeds: [getRandomEmbed(member.id)] });
      }
    });

  }, 60000);
}

module.exports = { startReminder, getRandomEmbed };
