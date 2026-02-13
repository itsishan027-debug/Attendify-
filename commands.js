const { 
  SlashCommandBuilder, 
  REST, 
  Routes 
} = require("discord.js");

const { CLIENT_ID, TOKEN } = require("./config");

async function registerCommands() {

  const commands = [

    new SlashCommandBuilder()
      .setName("setup")
      .setDescription("Open admin setup panel"),

    new SlashCommandBuilder()
      .setName("help")
      .setDescription("Show full help guide"),

    new SlashCommandBuilder()
      .setName("about")
      .setDescription("About this bot")

  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    console.log("🔄 Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Slash commands registered successfully.");
  } catch (error) {
    console.error("❌ Error registering commands:", error);
  }
}

module.exports = { registerCommands };
