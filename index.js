const { 
  Client, 
  GatewayIntentBits, 
  Partials 
} = require("discord.js");

const { TOKEN } = require("./config");
const { registerCommands } = require("./commands");
const { loadData, data, saveData, ensureUser } = require("./data");
const { startReminder } = require("./reminder");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, // ✅ REQUIRED FOR ONLINE/OFFLINE
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});


// =======================
// BOT READY
// =======================

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  loadData();
  await registerCommands();
  startReminder(client);
});


// =======================
// PRESENCE TRACKING
// =======================

client.on("presenceUpdate", async (oldPresence, newPresence) => {

  if (!newPresence || !newPresence.member) return;

  const userId = newPresence.member.id;
  const status = newPresence.status;

  // Ignore bots
  if (newPresence.member.user.bot) return;

  ensureUser(userId);

  const channelId = data.settings?.channelId;
  if (!channelId) return;

  const channel = newPresence.guild.channels.cache.get(channelId);
  if (!channel) return;

  // ================= ONLINE =================
  if (status === "online" || status === "idle" || status === "dnd") {

    if (!data[userId].startTime) {
      data[userId].startTime = Date.now();
      saveData();

      const onlineTimestamp = Math.floor(Date.now() / 1000);

      channel.send(
        `🟢 <@${userId}> is now **ONLINE**\n\n` +
        `🟢 Online: <t:${onlineTimestamp}:t>`
      );
    }
  }

  // ================= OFFLINE =================
  if (status === "offline") {

    const startTime = data[userId].startTime;
    if (!startTime) return;

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    function formatDuration(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }

    const onlineTimestamp = Math.floor(startTime / 1000);
    const offlineTimestamp = Math.floor(endTime / 1000);

    channel.send(
      `🔴 <@${userId}> is now **OFFLINE**\n\n` +
      `🟢 Online: <t:${onlineTimestamp}:t>\n` +
      `🔴 Offline: <t:${offlineTimestamp}:t>\n` +
      `⏱ Duration: ${formatDuration(durationMs)}`
    );

    // Reset startTime
    data[userId].startTime = null;
    saveData();
  }

});


// =======================
// INTERACTION HANDLER
// =======================

client.on("interactionCreate", async (interaction) => {

  try {

    if (interaction.isChatInputCommand()) {

      if (interaction.commandName === "setup") {
        return require("./setup").handleSetup(interaction);
      }

      if (interaction.commandName === "help") {
        return interaction.reply({
          content: "📘 Help section coming soon.",
          ephemeral: true
        });
      }

      if (interaction.commandName === "about") {
        return interaction.reply({
          content: "🤖 Bot created for attendance tracking system.",
          ephemeral: true
        });
      }
    }

    if (interaction.isButton()) {
      return require("./setup").handleButton(interaction);
    }

    if (interaction.isModalSubmit()) {
      return require("./setup").handleModal(interaction);
    }

  } catch (error) {
    console.error("❌ Interaction Error:", error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "⚠️ Something went wrong.", ephemeral: true });
    } else {
      await interaction.reply({ content: "⚠️ Something went wrong.", ephemeral: true });
    }
  }

});


// =======================
// LOGIN
// =======================

client.login(TOKEN);
