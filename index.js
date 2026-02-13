const {
Client,
GatewayIntentBits
} = require('discord.js');

const {attendanceEmbed,reminderEmbed} = require("./embed")

const client = new Client({
intents:[GatewayIntentBits.Guilds]
});

const SERVER_ID = "1434084048719843420"
const CHANNEL_ID = "1471509183215173664"

let data = {};

function formatDuration(ms){
const totalSeconds=Math.floor(ms/1000)
const hours=Math.floor(totalSeconds/3600)
const minutes=Math.floor((totalSeconds%3600)/60)
const seconds=totalSeconds%60
return `${hours}h ${minutes}m ${seconds}s`
}

client.on("interactionCreate",async interaction=>{

if(!interaction.isChatInputCommand()) return;

if(interaction.commandName==="attend"){

const now=Date.now();
data[interaction.user.id]=now;

await interaction.reply({
embeds:[attendanceEmbed(interaction.user,formatDuration(0))]
})
}

})

setInterval(async()=>{

const guild=client.guilds.cache.get(SERVER_ID)
if(!guild) return;

const channel=guild.channels.cache.get(CHANNEL_ID)
if(!channel) return;

for(const id in data){

const diff=Date.now()-data[id]

if(diff>3600000){

const member=await guild.members.fetch(id)

channel.send({
embeds:[reminderEmbed(member.user)]
})

data[id]=Date.now()
}
}

},600000)

client.login(process.env.TOKEN);