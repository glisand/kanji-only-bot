const { ChannelType } = require('discord.js');

let allowedStrings = [];
let ignoredChannels = new Set();

// Check message
const checkMessageContent = async (message, getLogChannelID) => {
    if (message.author.bot) return;

    // Skip ignore channel
    if (ignoredChannels.has(message.channel.id)) return;

    const logChannelID = getLogChannelID();
    const logChannel = await message.client.channels.fetch(logChannelID);

    // Delete Mentions, links, newlines. Then check remaining texts.
    const content = message.content.replace(/<@!?[0-9]+>|https?:\/\/\S+|\s/g, '');
    const kanjiOnlyPattern = /^[\u4E00-\u9FFF]*$/;
    const isAllowed = allowedStrings.some(allowedString => content.includes(allowedString));

    if (!kanjiOnlyPattern.test(content) && !isAllowed) {
        if (message.channel.type === ChannelType.GuildForum || message.channel.isThread()) {
            // If the thread title is not in Kanji characters, delete the thread
            const thread = message.channel;
            if (!kanjiOnlyPattern.test(thread.name)) {
                await thread.delete(`スレッドのタイトルに漢字以外の文字が含まれているため削除`);
                if (logChannel) {
                    await logChannel.send(`**処罰記録**\nスレッド名：${thread.name}\n理由：漢字以外の文字が含まれているため削除されました。`);
                }
                return;
            }
        }

        // Delete messages containing non-Kanji characters
        await message.delete();
        if (logChannel) {
            await logChannel.send(`**処罰記録**\nユーザー：${message.author.tag}\n日時：${message.createdAt}\nメッセージ内容：${message.content}`);
        }
    }
};

// Join new member
const handleGuildMemberAdd = async (member, getLogChannelID) => {
    const logChannelID = getLogChannelID();
    const logChannel = await member.client.channels.fetch(logChannelID);
    const userNick = member.displayName;
    const kanjiOnlyPattern = /^[\u4E00-\u9FFF]+$/;

    if (!kanjiOnlyPattern.test(userNick)) {
        const RESTRICTED_ROLE_ID = 'Restrict user ID here';
        const restrictedRole = member.guild.roles.cache.get(RESTRICTED_ROLE_ID);
        if (restrictedRole) {
            await member.roles.add(restrictedRole);
            if (logChannel) {
                await logChannel.send(`**処罰記録**\nユーザー：${member.user.tag}\n理由：漢字以外の文字が含まれているため、制限役職を付与されました。`);
            }
        } else {
            if (logChannel) {
                await logChannel.send(`**エラー記録**\nエラー：ID ${RESTRICTED_ROLE_ID} の役職が見つかりません。`);
            }
        }
    } else {
        if (logChannel) {
            await logChannel.send(`**処罰記録**\nユーザー：${member.user.tag}\nユーザーは漢字のみのニックネームを持っています。`);
        }
    }
};

// When a member's nickname is changed
const handleGuildMemberUpdate = async (oldMember, newMember, getLogChannelID) => {
    const logChannelID = getLogChannelID();
    const logChannel = await newMember.client.channels.fetch(logChannelID);
    const oldNick = oldMember.displayName;
    const newNick = newMember.displayName;
    const kanjiOnlyPattern = /^[\u4E00-\u9FFF]+$/;
    
    if (oldNick !== newNick) {
        const RESTRICTED_ROLE_ID = 'Restrict user ID here';
        const restrictedRole = newMember.guild.roles.cache.get(RESTRICTED_ROLE_ID);
        if (!kanjiOnlyPattern.test(newNick)) {
            if (restrictedRole) {
                await newMember.roles.add(restrictedRole);
                if (logChannel) {
                    await logChannel.send(`**処罰記録**\nユーザー：${newMember.user.tag}\n新ニックネーム：${newNick}\n理由：漢字以外の文字が含まれているため、制限役職を付与されました。`);
                }
            } else {
                if (logChannel) {
                    await logChannel.send(`**エラー記録**\nエラー：ID ${RESTRICTED_ROLE_ID} の役職が見つかりません。`);
                }
            }
        } else {
            if (restrictedRole) {
                await newMember.roles.remove(restrictedRole);
                if (logChannel) {
                    await logChannel.send(`**処罰記録**\nユーザー：${newMember.user.tag}\n新ニックネーム：${newNick}\n理由：漢字のみのため、制限役職が削除されました。`);
                }
            } else {
                if (logChannel) {
                    await logChannel.send(`**エラー記録**\nエラー：ID ${RESTRICTED_ROLE_ID} の役職が見つかりません。`);
                }
            }
        }
    }
};

module.exports = {
    allowedStrings,
    ignoredChannels,
    checkMessageContent,
    handleGuildMemberAdd,
    handleGuildMemberUpdate
};