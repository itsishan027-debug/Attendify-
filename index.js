const { 
  Client, 
  GatewayIntentBits, 
  Partials 
} = require("discord.js");

const { TOKEN } = require("./config");
const { registerCommands } = require("./commands");
const { loadData } = require("./data");
const { startReminder } = require("./reminder");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});


// =======================
// BOT READY
// =======================

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  loadData();              // Load JSON
  await registerCommands(); // Register Slash Commands
  startReminder(client);    // Start Reminder System
});


// =======================
// INTERACTION HANDLER
// =======================

client.on("interactionCreate", async (interaction) => {

  try {

    // ===== SLASH COMMANDS =====
    if (interaction.isChatInputCommand()) {

      // SETUP PANEL
      if (interaction.commandName === "setup") {
        return require("./setup").handleSetup(interaction);
      }

      // HELP
      if (interaction.commandName === "help") {
        return interaction.reply({
          content: "📘 Help section coming soon.",
          ephemeral: true
        });
      }

      // ABOUT
      if (interaction.commandName === "about") {
        return interaction.reply({
          content: "🤖 Bot created for attendance tracking system.",
          ephemeral: true
        });
      }
    }

    // ===== BUTTON HANDLER =====
    if (interaction.isButton()) {
      return require("./setup").handleButton(interaction);
    }

    // ===== MODAL HANDLER =====
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
