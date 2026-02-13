const { data } = require("./data");
const { getRandomEmbed } = require("./embeds");

function startReminder(client) {

  setInterval(async () => {

    if (!data.settings.reminderEnabled) return;

    const now = new Date();
    if (now.getHours() !== data.settings.reminderHour || now.getMinutes() !== 0) return;

    const guild = client.guilds.cache.get(data.settings.serverId);
    if (!guild) return;

    const channel = guild.channels.cache.get(data.settings.channelId);
    if (!channel) return;

    await guild.members.fetch();

    const today = new Date();
    today.setHours(0,0,0,0);

    guild.members.cache.forEach(member => {

      if (member.user.bot) return;

      const r = data.users?.[member.id];

      if (!r || !r.lastSeen || r.lastSeen < today.getTime()) {
        channel.send({ embeds: [getRandomEmbed(member.id)] });
      }

    });

  }, 60000);
}

module.exports = { startReminder };