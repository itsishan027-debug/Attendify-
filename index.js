const { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes } = require('discord.js');
const config = require('./config');
const { handleOnline, handleOffline, forceOfflineAll } = require('./attendance');
const { startReminder, getReminderEmbed } = require('./reminder');
const { data, saveData } = require('./data');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Aries Online ✅'));
app.listen(process.env.PORT || 8080);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers
    ]
});

// Trigger Logic for "Online" and "Offline" text
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

// Admin Slash Commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    // Check if the user is an Admin (Admin 1 or Admin 2)
    if (!config.ADMIN_IDS.includes(interaction.user.id)) {
        return interaction.reply({ content: "❌ Unauthorized Access", ephemeral: true });
    }

    // --- RESTART COMMAND FIXED ---
    if (interaction.commandName === 'restart') {
        await interaction.deferReply({ ephemeral: true });
        try {
            await interaction.editReply("🔄 **System Restart Initiated...** Saving all active sessions.");
            await forceOfflineAll(client);
            await interaction.followUp("✅ Database synced. The bot will be back online in a few seconds.");
            
            // Short delay to ensure messages are sent before process exits
            setTimeout(() => process.exit(0), 3000); 
        } catch (e) {
            await interaction.editReply("❌ Restart failed during session save.");
        }
    }

    // --- TEST REMINDER FIXED ---
    if (interaction.commandName === 'testreminder') {
        await interaction.deferReply({ ephemeral: true });
        try {
            const target = interaction.options.getUser('target');
            const ch = await client.channels.fetch(config.TARGET_CHANNEL_ID);
            await ch.send({ content: `<@${target.id}>`, embeds: [getReminderEmbed(target.id)] });
            await interaction.editReply(`✅ Test reminder successfully sent to ${target.tag}`);
        } catch (e) { await interaction.editReply("❌ Error sending reminder. Check permissions."); }
    }

    // --- SET SLOT FIXED ---
    if (interaction.commandName === 'setslot') {
        await interaction.deferReply({ ephemeral: true });
        try {
            const num = interaction.options.getInteger('number') - 1;
            data.settings.customSlots[num] = { 
                roleId: interaction.options.getString('roleid'), 
                msg: interaction.options.getString('message') 
            };
            saveData();
            await interaction.editReply(`✅ Slot ${num+1} has been updated.`);
        } catch (e) { await interaction.editReply("❌ Error saving slot data."); }
    }
});

client.once('ready', async () => {
    const commands = [
        new SlashCommandBuilder().setName('setslot').setDescription('Configure custom role message')
            .addIntegerOption(o => o.setName('number').setDescription('Slot 1-3').setRequired(true))
            .addStringOption(o => o.setName('roleid').setDescription('Target Role ID').setRequired(true))
            .addStringOption(o => o.setName('message').setDescription('Custom Msg (use {user} for tag)').setRequired(true)),
        new SlashCommandBuilder().setName('restart').setDescription('Save all data and reboot the bot'),
        new SlashCommandBuilder().setName('testreminder').setDescription('Send a test savage reminder')
            .addUserOption(o => o.setName('target').setDescription('Member to target').setRequired(true))
    ];

    const rest = new REST({ version: '10' }).setToken(config.TOKEN);
    await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });
    
    startReminder(client);
    const ch = await client.channels.fetch(config.TARGET_CHANNEL_ID);
    if (ch) ch.send("🚀 **Aries Attendance System is ONLINE and Ready!**");
    console.log("✅ Bot is Ready!");
});

client.login(config.TOKEN);
