require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const { TARGET_SERVER_ID, TARGET_CHANNEL_ID, TOKEN } = require("./config");
const { loadData, saveData, ensureUser } = require("./data");
const { handleOnline, handleOffline, handleStatus, handleHistory } = require("./attendance");
const { startReminder } = require("./reminder");
const { handleSetup, handleReset } = require("./setup");

const app = express();
app.get("/", (req, res) => res.send("Bot Running"));
app.listen(3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

loadData();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.guild.id !== TARGET_SERVER_ID) return;
  if (message.channel.id !== TARGET_CHANNEL_ID) return;

  const content = message.content.toLowerCase().trim();
  const userId = message.author.id;

  ensureUser(userId);
  require("./data").data[userId].lastSeen = Date.now();
  saveData();

  if (content === "online")
    return handleOnline(userId, (msg) => message.channel.send(msg));

  if (content === "offline")
    return handleOffline(userId, (msg) => message.channel.send(msg));
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.guildId !== TARGET_SERVER_ID) return;
  if (interaction.channelId !== TARGET_CHANNEL_ID)
    return interaction.reply({ content: "Wrong channel", ephemeral: true });

  const reply = (msg, ephemeral = false) =>
    interaction.reply(typeof msg === "string"
      ? { content: msg, ephemeral }
      : msg);

  const userId = interaction.user.id;

  if (interaction.commandName === "online")
    return handleOnline(userId, reply);

  if (interaction.commandName === "offline")
    return handleOffline(userId, reply);

  if (interaction.commandName === "status")
    return handleStatus(userId, reply);

  if (interaction.commandName === "history")
    return handleHistory(userId, reply);

  if (interaction.commandName === "setup")
    return handleSetup(userId, reply);

  if (interaction.commandName === "resetdata")
    return handleReset(userId, reply);

  if (interaction.commandName === "help")
    return reply("Use /online, /offline, /status, /history, /setup");

  if (interaction.commandName === "about")
    return reply("Attendance Bot v2.0 | Created for private server tracking.");
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  startReminder(client, TARGET_SERVER_ID, TARGET_CHANNEL_ID);
});

client.login(TOKEN);
