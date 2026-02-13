const { EmbedBuilder } = require("discord.js");
const { ADMIN_IDS } = require("./config");
const { data, saveData } = require("./data");

function isAdmin(id) {
  return ADMIN_IDS.includes(id);
}

async function handleSetup(userId, reply) {
  if (!isAdmin(userId))
    return reply("❌ You are not authorized to use setup.", true);

  return reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Gold")
        .setTitle("⚙ Admin Setup Panel")
        .setDescription(
          "• Change IDs inside config.js\n" +
          "• Change reminder time in config.js\n" +
          "• Use /resetdata to clear attendance"
        )
    ],
    ephemeral: true
  });
}

async function handleReset(userId, reply) {
  if (!isAdmin(userId))
    return reply("❌ You are not authorized.", true);

  Object.keys(data).forEach(k => delete data[k]);
  saveData();

  return reply("✅ All attendance data has been reset.");
}

module.exports = { handleSetup, handleReset };
