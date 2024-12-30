require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { registerCommands, handleCommandInteraction } = require('./commands');
const { checkMessageContent, handleGuildMemberAdd, handleGuildMemberUpdate } = require('./utils');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

let logChannelID = 'Log channnel ID here';
let restrictedRoleID = 'restricted role ID here';

// Set new log channel ID
const setLogChannelID = (newID) => {
    logChannelID = newID;
};

// Get current log channel ID
const getLogChannelID = () => logChannelID;

// Set new restraint roll ID
const setRestrictedRoleID = (newID) => {
    restrictedRoleID = newID;
};

// Get current restraint roll ID
const getRestrictedRoleID = () => restrictedRoleID;

// Bot ready
client.once('ready', async () => {
    await registerCommands(client);

    const logChannel = await client.channels.fetch(getLogChannelID());
    if (logChannel) {
        await logChannel.send('**BOTログ**\nBot is ready and commands are registered.');
    }
    console.log(`Logged in as ${client.user.tag}!`);
});

// Message handlers
client.on('messageCreate', (message) => checkMessageContent(message, getLogChannelID));
client.on('messageUpdate', async (_, newMessage) => {
    await checkMessageContent(newMessage, getLogChannelID);
});

// Command interactions
client.on('interactionCreate', async interaction => {
    await handleCommandInteraction(interaction, client, getLogChannelID, setLogChannelID, getRestrictedRoleID, setRestrictedRoleID);
});

// Guild member handlers
client.on('guildMemberAdd', (member) => handleGuildMemberAdd(member, getLogChannelID));
client.on('guildMemberUpdate', (oldMember, newMember) => handleGuildMemberUpdate(oldMember, newMember, getLogChannelID));

// Botログイン
client.login(process.env.DISCORD_TOKEN);
