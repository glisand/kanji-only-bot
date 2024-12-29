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

// 新しいログチャンネルIDを設定するための関数
const setLogChannelID = (newID) => {
    logChannelID = newID;
};

// 現在のログチャンネルIDを取得するための関数
const getLogChannelID = () => logChannelID;

// 新しい制限ロールIDを設定するための関数
const setRestrictedRoleID = (newID) => {
    restrictedRoleID = newID;
};

// 現在の制限ロールIDを取得するための関数
const getRestrictedRoleID = () => restrictedRoleID;

// Botが準備完了したときの処理
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