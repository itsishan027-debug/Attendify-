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
const { getRandomEmbed } = require("./reminder");

function isAdmin(id) {
  return ADMIN_IDS.includes(id);
}

async function handleSetup(interaction) {

  if (!isAdmin(interaction.user.id))
    return interaction.reply({ content: "❌ Unauthorized", ephemeral: true });

  const embed = new EmbedBuilder()
    .setTitle("⚙️ Advanced Setup Panel")
    .setDescription("Configure server & channel settings below.")
    .setColor(0x5865F2)
    .setFooter({ text: "Attendify System" })
    .setTimestamp();

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
      .setCustomId("test_reminder")
      .setLabel("🧪 Test Reminder")
      .setStyle(ButtonStyle.Primary),

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

  // ================= SET CHANNEL =================
  if (interaction.customId === "set_channel") {

    await interaction.reply({
      content: "📌 Mention the channel (example: #attendance)",
      ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;

    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 30000,
      max: 1
    });

    collector.on("collect", msg => {

      const channel = msg.mentions.channels.first();

      if (!channel)
        return msg.reply("❌ No valid channel mentioned.");

      data.settings.serverId = interaction.guild.id;
      data.settings.channelId = channel.id;
      saveData();

      msg.reply(`✅ Channel set to ${channel}`);
    });
  }

  // ================= SET TIME =================
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

  // ================= TOGGLE REMINDER =================
  if (interaction.customId === "toggle_reminder") {

    data.settings.reminderEnabled = !data.settings.reminderEnabled;
    saveData();

    return interaction.reply({
      content: `🔁 Reminder is now ${data.settings.reminderEnabled ? "ENABLED" : "DISABLED"}`,
      ephemeral: true
    });
  }

  // ================= TEST REMINDER =================
  if (interaction.customId === "test_reminder") {

    if (!data.settings.channelId) {
      return interaction.reply({
        content: "❌ Reminder channel not set.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content: "👤 Mention the user for test reminder.",
      ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;

    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 30000,
      max: 1
    });

    collector.on("collect", async msg => {

      const mentionedUser = msg.mentions.users.first();
      if (!mentionedUser)
        return msg.reply("❌ No valid user mentioned.");

      const channel = interaction.guild.channels.cache.get(data.settings.channelId);
      if (!channel)
        return msg.reply("❌ Reminder channel not found.");

      await channel.send({
        embeds: [getRandomEmbed(mentionedUser.id)]
      });

      msg.reply("✅ Test Reminder Sent!");
    });
  }

  // ================= VIEW SETTINGS =================
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

    const hour = parseInt(
      interaction.fields.getTextInputValue("hour_input")
    );

    if (isNaN(hour) || hour < 0 || hour > 23)
      return interaction.reply({
        content: "❌ Invalid hour (0–23 only)",
        ephemeral: true
      });

    data.settings.reminderHour = hour;
    saveData();

    return interaction.reply({
      content: `⏰ Reminder time set to ${hour}:00`,
      ephemeral: true
    });
  }
}

module.exports = {
  handleSetup,
  handleButton,
  handleModal
};
