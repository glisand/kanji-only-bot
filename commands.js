const { REST, Routes, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { allowedStrings, ignoredChannels } = require('./utils');

// Admin role (can execute commands)
const ADMIN_ROLE_ID = 'admin role id here';

const commands = [
    {
        name: 'allow',
        description: 'Add a string to the allowed list',
        options: [
            {
                name: 'string',
                type: 3,
                description: 'The string to allow',
                required: true
            }
        ]
    },
    {
        name: 'unallow',
        description: 'Show the allowed list for removal',
        type: 1,
    },
    {
        name: 'list-allowed',
        description: 'List all allowed strings',
        type: 1
    },
    {
        name: 'set-log-channel',
        description: 'Set the log channel ID',
        options: [
            {
                name: 'channel_id',
                type: 3,
                description: 'The ID of the new log channel',
                required: true
            }
        ]
    },
    {
        name: 'set-restricted-role',
        description: 'Set the restricted role ID',
        options: [
            {
                name: 'role_id',
                type: 3,
                description: 'The ID of the new restricted role',
                required: true
            }
        ]
    },
    {
        name: 'ignore-channel',
        description: 'Add a channel to the ignore list',
        options: [
            {
                name: 'channel',
                type: 3,
                description: 'The channel to ignore (e.g., #channel-name)',
                required: true
            }
        ]
    },
    {
        name: 'unignore-channel',
        description: 'Select a channel to unignore',
        type: 1
    },
    {
        name: 'list-ignored-channels',
        description: 'List all ignored channels',
        type: 1
    }
];

const registerCommands = async (client) => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );
        console.log('Slash commands registered successfully.');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
};

const handleCommandInteraction = async (interaction, client, getLogChannelID, setLogChannelID, getRestrictedRoleID, setRestrictedRoleID) => {
    const logChannel = await client.channels.fetch(getLogChannelID());
    const { commandName, options } = interaction;

    // Process commands that require specific roles
    if ((!['list-allowed', 'list-ignored-channels'].includes(commandName)) && !interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        await interaction.reply({ content: 'このコマンドを実行する権限がありません。', ephemeral: true });
        return;
    }

    const extractChannelId = (channelMention) => {
        const match = channelMention.match(/^<#(\d+)>$/);
        return match ? match[1] : channelMention;
    };

    if (commandName === 'allow') {
        const stringToAllow = options.getString('string');
        allowedStrings.push(stringToAllow);
        await interaction.reply(`許可された文字列: "${stringToAllow}" が追加されました。`);
        if (logChannel) {
            await logChannel.send(`**処罰記録**\nユーザー：${interaction.user.tag}\nコマンド: /allow\n許可された文字列: ${stringToAllow}`);
        }
    }

    if (commandName === 'unallow') {
        if (allowedStrings.length === 0) {
            await interaction.reply({ content: '削除する許可文字列がありません。', ephemeral: true });
            return;
        }

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select-unallow')
                .setPlaceholder('削除する文字列を選択...')
                .addOptions(allowedStrings.map((str, index) => ({ label: str, value: index.toString() })))
        );

        await interaction.reply({ content: '削除する文字列を選択してください。', components: [row], ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'select-unallow') {
        const selected = interaction.values[0];
        const removedString = allowedStrings.splice(parseInt(selected), 1)[0];

        if (logChannel) {
            await logChannel.send(`**処罰記録**\nユーザー：${interaction.user.tag}\n削除された文字列: ${removedString}`);
        }

        await interaction.update({ content: `許可を取り消し: "${removedString}" が削除されました。`, components: [] });
    }

    if (commandName === 'list-allowed') {
        if (allowedStrings.length > 0) {
            await interaction.reply(`許可された文字列:\n- ${allowedStrings.join('\n- ')}`);
        } else {
            await interaction.reply('許可された文字列はありません。');
        }
    }

    if (commandName === 'set-log-channel') {
        const newChannelId = extractChannelId(options.getString('channel_id'));
        setLogChannelID(newChannelId);
        await interaction.reply(`新しいログチャンネルID: ${newChannelId} が設定されました。`);
    }

    if (commandName === 'set-restricted-role') {
        const newRoleId = options.getString('role_id');
        setRestrictedRoleID(newRoleId);
        await interaction.reply(`新しい制限ロールID: ${newRoleId} が設定されました。`);
    }

    if (commandName === 'ignore-channel') {
        const channelMention = options.getString('channel');
        const channelId = extractChannelId(channelMention);
        ignoredChannels.add(channelId);
        await interaction.reply(`チャンネル: ${channelMention} が無視リストに追加されました。`);
    }

    if (commandName === 'unignore-channel') {
        if (ignoredChannels.size === 0) {
            await interaction.reply({ content: '無視リストから削除するチャンネルがありません。', ephemeral: true });
            return;
        }

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select-unignore-channel')
                .setPlaceholder('削除するチャンネルを選択...')
                .addOptions([...ignoredChannels].map(id => ({
                    label: `#${client.channels.cache.get(id)?.name || 'Unknown Channel'}`,
                    value: id.toString()
                })))
        );

        await interaction.reply({ content: '削除するチャンネルを選択してください。', components: [row], ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'select-unignore-channel') {
        const selected = interaction.values[0];
        ignoredChannels.delete(selected);

        if (logChannel) {
            await logChannel.send(`**処罰記録**\nユーザー：${interaction.user.tag}\n無視リストから削除されたチャンネル: <#${selected}>`);
        }

        await interaction.update({ content: `無視リストから削除されました: <#${selected}>`, components: [] });
    }

    if (commandName === 'list-ignored-channels') {
        if (ignoredChannels.size > 0) {
            await interaction.reply(`無視されているチャンネル:\n- ${[...ignoredChannels].map(id => `<#${id}>`).join('\n- ')}`);
        } else {
            await interaction.reply('無視されているチャンネルはありません。');
        }
    }
};

module.exports = {
    registerCommands,
    handleCommandInteraction
};