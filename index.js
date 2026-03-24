const { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes } = require('discord.js');
const config = require('./config');
const { handleOnline, handleOffline, forceOfflineAll } = require('./attendance');
const { startReminder, getReminderEmbed } = require('./reminder');
const { data, saveData } = require('./data');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Aries Bot Online ✅'));
app.listen(process.env.PORT || 8080);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// Message Triggers (online/offline)
client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !msg.guild || msg.channel.id !== config.TARGET_CHANNEL_ID) return;
    const content = msg.content.toLowerCase().trim();
    const reply = async (opt) => msg.channel.send(opt);

    if (content === 'online') { 
        await msg.delete().catch(() => {});
        await handleOnline(msg.member, reply); 
    }
    if (content === 'offline') { 
        await msg.delete().catch(() => {});
        await handleOffline(msg.member, reply); 
    }
});

// Admin Commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!config.ADMIN_IDS.includes(interaction.user.id)) return interaction.reply({ content: "❌ No Permission", ephemeral: true });

    if (interaction.commandName === 'setslot') {
        const num = interaction.options.getInteger('number') - 1;
        data.settings.customSlots[num] = {
            roleId: interaction.options.getString('roleid'),
            msg: interaction.options.getString('message')
        };
        saveData();
        await interaction.reply(`✅ Slot ${num+1} updated!`);
    }

    if (interaction.commandName === 'testreminder') {
        const target = interaction.options.getUser('target');
        const channel = await client.channels.fetch(config.TARGET_CHANNEL_ID);
        await channel.send({ content: `<@${target.id}>`, embeds: [getReminderEmbed(target.id)] });
        await interaction.reply({ content: "✅ Test reminder sent!", ephemeral: true });
    }

    if (interaction.commandName === 'restart') {
        await interaction.reply("🔄 Saving sessions and restarting...");
        await forceOfflineAll(client);
        setTimeout(() => process.exit(), 2000);
    }
});

client.once('ready', async () => {
    const commands = [
        new SlashCommandBuilder().setName('setslot').setDescription('Configure custom role message')
            .addIntegerOption(o => o.setName('number').setDescription('Slot 1-3').setRequired(true))
            .addStringOption(o => o.setName('roleid').setDescription('Role ID').setRequired(true))
            .addStringOption(o => o.setName('message').setDescription('Msg ({user} for mention)').setRequired(true)),
        new SlashCommandBuilder().setName('restart').setDescription('Safe system restart'),
        new SlashCommandBuilder().setName('testreminder').setDescription('Test a savage reminder')
            .addUserOption(o => o.setName('target').setDescription('User to target').setRequired(true))
    ];

    const rest = new REST({ version: '10' }).setToken(config.TOKEN);
    await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });
    
    startReminder(client);
    const ch = await client.channels.fetch(config.TARGET_CHANNEL_ID);
    if (ch) ch.send("🚀 **Aries Attendance System is ONLINE!**");
    console.log("✅ Bot Ready");
});

client.login(config.TOKEN);
