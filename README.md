# Kanji Only Bot

This is a Discord bot that enforces a "Kanji Only" rule on specified channels. It supports various commands to manage allowed strings, ignored channels, and logging settings.

## Setup Instructions

1. Clone this repository to your local machine:
    ```sh
    git clone https://github.com/your-username/kanji-only-bot.git

2. Navigate to the project directory:
    ```sh
    cd kanji-only-bot

3. Install the required dependencies:
    ```sh
    npm install

4. Create a `.env` file in the root directory and add your Discord bot token, client ID, and guild ID:
    ```env
    DISCORD_TOKEN=your-bot-token-here
    CLIENT_ID=your-client-id-here
    GUILD_ID=your-guild-id-here
    ```

5. Update the placeholder values (e.g., `role id here`) in the code with actual IDs. Specifically, you need to replace:
    - `ADMIN_ROLE_ID` in `commands.js` with the ID of the role that has permission to use most commands.

6. Start the bot:
    ```sh
    node index.js

## Configuration

### .env File

Ensure your `.env` file contains the following environment variables:

```env
DISCORD_TOKEN=your-bot-token-here
CLIENT_ID=your-client-id-here
GUILD_ID=your-guild-id-here
```

### Role and Channel IDs

In `commands.js`, replace `your-admin-role-id` with the actual ID of the role that has permission to use admin commands.

## Commands

The bot supports the following commands:

### `/allow <string>`

Add a string to the allowed list. Only users with the Admin role can use this command.

### `/unallow`

Show the allowed list for removal. Presents a dropdown menu to remove an allowed string. Only users with the Admin role can use this command.

### `/list-allowed`

List all allowed strings.

### `/set-log-channel <channel_id>`

Set the log channel ID. This is where all logs will be sent. Only users with the Admin role can use this command.

### `/set-restricted-role <role_id>`

Set the restricted role ID. Only users with the Admin role can use this command.

### `/ignore-channel <channel>`

Add a channel to the ignore list. Messages in this channel will not be checked for the "Kanji Only" rule. Only users with the Admin role can use this command.

### `/unignore-channel`

Select a channel to unignore from a dropdown menu. Allows removal of a channel from the ignore list. Only users with the Admin role can use this command.

### `/list-ignored-channels`

List all ignored channels.

## Usage Notes

- The bot automatically checks messages in all channels for non-Kanji characters, except for channels in the ignore list.
- On detecting a message with non-Kanji characters (excluding allowed strings, spaces, and links), the bot deletes the message and logs the action.
- The bot also monitors user nicknames. If a nickname contains non-Kanji characters, a restricted role is assigned to the user.

## License

This project is licensed under the MIT License.
