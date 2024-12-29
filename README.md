# Kanji Only Bot

This is a Discord bot that enforces a "Kanji Only" rule on specified channels. It supports various commands to manage allowed strings, ignored channels, and logging settings.

## Setup Instructions

1. **Clone the Repository**: Clone this repository to your local machine:
    ```sh
    git clone https://github.com/your-username/kanji-only-bot.git
    ```

2. **Navigate to the Project Directory**: 
    ```sh
    cd kanji-only-bot
    ```

3. **Install Dependencies**:
   ```sh
   npm install
   ```

5. **Create a `.env` File**:

   Create a `.env` file in the root directory and add your Discord bot token, client ID, and guild ID:
    ```env
    DISCORD_TOKEN=your-bot-token-here
    CLIENT_ID=your-client-id-here
    GUILD_ID=your-guild-id-here
    ```

7. **Configure Role and Channel IDs**: Update the following placeholder values in the code with actual IDs:

    - **`index.js`**:
      - Line 15: Replace `'Log channel ID here'` with the actual ID of the channel where logs should be sent.
      - Line 16: Replace `'restricted role ID here'` with the actual ID of the role to be assigned to users with non-Kanji nicknames.

    - **`commands.js`**:
      - Line 5: Replace `'admin role id here'` with the actual ID of the role that has permission to use admin commands.

    - **`utils.js`**:
      - Line 50 and 78: Replace `'Restrict user ID here'` with the actual ID of the role to be assigned to users with non-Kanji nicknames.

6. **Start the Bot**: 
    ```sh
    node index.js
    ```

## Configuration

### .env File

Ensure your `.env` file contains the following environment variables:

```env
DISCORD_TOKEN=your-bot-token-here
CLIENT_ID=your-client-id-here
GUILD_ID=your-guild-id-here
```

### Role and Channel IDs

- **Log Channel ID**: This is the channel where all logs will be sent. Set this in `index.js` on line 15.
- **Restricted Role ID**: This role is assigned to users with non-Kanji nicknames. Set this in `index.js` on line 16 and `utils.js` on lines 50 and 78.
- **Admin Role ID**: This role has permission to use admin commands. Set this in `commands.js` on line 5.

## Commands

The bot supports the following commands:

- **`/allow <string>`**: Add a string to the allowed list. Only users with the Admin role can use this command.
- **`/unallow`**: Show the allowed list for removal. Presents a dropdown menu to remove an allowed string. Only users with the Admin role can use this command.
- **`/list-allowed`**: List all allowed strings.
- **`/set-log-channel <channel_id>`**: Set the log channel ID. Only users with the Admin role can use this command.
- **`/set-restricted-role <role_id>`**: Set the restricted role ID. Only users with the Admin role can use this command.
- **`/ignore-channel <channel>`**: Add a channel to the ignore list. Only users with the Admin role can use this command.
- **`/unignore-channel`**: Select a channel to unignore from a dropdown menu. Only users with the Admin role can use this command.
- **`/list-ignored-channels`**: List all ignored channels.

## Usage Notes

- The bot automatically checks messages in all channels for non-Kanji characters, except for channels in the ignore list.
- On detecting a message with non-Kanji characters (excluding allowed strings, spaces, and links), the bot deletes the message and logs the action.
- The bot also monitors user nicknames. If a nickname contains non-Kanji characters, a restricted role is assigned to the user.

## License

This project is licensed under the MIT License.
