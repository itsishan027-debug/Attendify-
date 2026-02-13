const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const { ADMIN_IDS } = require("./config");
const { data, saveData } = require("./data");

function isAdmin(id) {
  return ADMIN_IDS.includes(id);
}

async function handleSetup(interaction) {
  if (!isAdmin(interaction.user.id))
    return interaction.reply({ content: "❌ Unauthorized", ephemeral: true });

  const embed = new EmbedBuilder()
    .setTitle("⚙️ Advanced Setup Panel")
    .setDescription("Configure server & channel settings below.")
    .setColor("Blue");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("set_channel")
      .setLabel("Set Channel")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("set_time")
      .setLabel("Set Reminder Time")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("toggle_reminder")
      .setLabel("Toggle Reminder")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("view_settings")
      .setLabel("View Settings")
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true
  });
}

async function handleButton(interaction) {
  if (!isAdmin(interaction.user.id))
    return interaction.reply({ content: "❌ Unauthorized", ephemeral: true });

  // SET CHANNEL
  if (interaction.customId === "set_channel") {
    await interaction.reply({
      content: "📌 Mention the channel (example: #attendance)",
      ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

    collector.on("collect", msg => {
      const channel = msg.mentions.channels.first();
      if (!channel)
        return msg.reply("❌ No valid channel mentioned.");

      data.settings.serverId = interaction.guild.id; // auto current server
      data.settings.channelId = channel.id;
      saveData();

      msg.reply(`✅ Channel set to ${channel}`);
    });
  }

  // SET TIME (MODAL)
  if (interaction.customId === "set_time") {
    const modal = new ModalBuilder()
      .setCustomId("time_modal")
      .setTitle("Set Reminder Time");

    const input = new TextInputBuilder()
      .setCustomId("hour_input")
      .setLabel("Enter hour (0–23)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    return interaction.showModal(modal);
  }

  // TOGGLE
  if (interaction.customId === "toggle_reminder") {
    data.settings.reminderEnabled = !data.settings.reminderEnabled;
    saveData();

    return interaction.reply({
      content: `🔁 Reminder is now ${data.settings.reminderEnabled ? "ENABLED" : "DISABLED"}`,
      ephemeral: true
    });
  }

  // VIEW
  if (interaction.customId === "view_settings") {
    const s = data.settings;

    return interaction.reply({
      content:
        `📊 Current Settings:\n\n` +
        `Server: ${interaction.guild.name}\n` +
        `Channel: ${s.channelId ? `<#${s.channelId}>` : "Not Set"}\n` +
        `Reminder: ${s.reminderEnabled ? "Enabled" : "Disabled"}\n` +
        `Hour: ${s.reminderHour}:00`,
      ephemeral: true
    });
  }
}

async function handleModal(interaction) {
  if (!isAdmin(interaction.user.id)) return;

  if (interaction.customId === "time_modal") {
    const hour = parseInt(interaction.fields.getTextInputValue("hour_input"));

    if (isNaN(hour) || hour < 0 || hour > 23)
      return interaction.reply({ content: "❌ Invalid hour (0–23 only)", ephemeral: true });

    data.settings.reminderHour = hour;
    saveData();

    return interaction.reply({
      content: `⏰ Reminder time set to ${hour}:00`,
      ephemeral: true
    });
  }
}

module.exports = { handleSetup, handleButton, handleModal };
