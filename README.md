# Discord-Bot
> [!NOTE]
> Uses:<br />
> Discord.js v14.15.2<br />
> node.js v22.14.0<br />
> nodemon v3.1.9<br />
> npm v10.9.2<br >

> [!IMPORTANT]
> As the bot is currently in development there will be issues and new features (soonTM)<br />
> I only work on this on my free time hence the irregular updates<br />
> The bot hasn't been fully stress tested and might break occasionaly<br />
> Currently there is no mobile support (might add later)<br />

<h2>How does this bot work?</h2>

> [!CAUTION]
> Follow the procedures below!<br />

Be sure to have Developer Mode enabled in Discord!<br />
-> Open Discord - User Settings - (App Settings) Advanced - Developer Mode -> ENABLE<br />
-> This is required due to the need of channel, role, user, message IDs<br />
<br />
Before you start this Bot make sure that you have all the required modules downloaded and installed<br />
Check that all folders and files are there<br />
<br />
-> Folders that you manually need to create: 'Assets' & 'Infos'<br />
Files that you manually need to create: In 'Infos' -> 'settings.json'<br />
<br />
-> Copy the content from the code which is located at the end of readme file into 'settings.json'<br />
<br />

> [!NOTE] 
> File 'index.js'<br />

1. MessageCreate<br />
The bot is checking all written messages for links and is deleting those messages<br />
The same is for all mistyped '/' commands -> unknown commands are deleted, this<br />
includes moderator commands as well<br />

2. MessageUpdate<br />
The deleted messages are written down in the msg-deleted channel<br />
The bot also checks for updated messages, this means once a message has been updated<br />
the previous message are written down in the msg-edited channel<br />

3. MessageDelete<br />
If a message has been deleted the bot is capturing the content and is creating a<br />
copy of this message and writes is down in the msg-deleted channel<br />
The same goes for the deleteMsg command<br />
<br />

> [!TIP]
> Upon executing a slash command a log is automatically created in the log channel<br />
> This is only true for the Moderator Area<br />

4. InteractionCreate
  - Command Interaction<br />
    - Moderator Area<br />
	  - [ ] rules: [wip]<br />
	  - [x] slow-mode: Allows a moderator to enable and disable slow mode in a channel. Duration can be between 1 - 999<br />
	  - [ ] purge: [wip]<br />
	  - [x] timeout: Give a user a timeout. <br />
	  - [x] kick: Kick a user from the server<br />
	  - [x] ban: Bans a user from the server<br />
	  - [x] delete: Deletes a message by it's id. An aditional log is being created on successfully deleting the message<br />
 
    - Admin Area<br />
	  - [x]  rulesbutton: Creates 2 buttons with different text sets, for the english channel "Accept" and "Deny" for the german one "Annehmen" and "Ablehnen"<br />
	  - [x]  rulesbutton2: Creates 2 buttons with different text sets, for the english channel "English" and "German" for the german one "Englisch" and "Deutsch"<br />
	  - [ ]  requestplayerbutton:<br />
	  - [x]  postmessage: Posts a embed messages<br />
	  - [x]  postrules: Posts the entire set of rules for the selected language in the channel id<br />
	  - [x]  purgeclean: Cleans a channel from a certain amount of messages. Amount can be between 1 - 999<br />
  
  - Button Interaction<br />
	- [x]  rulesbutton: Assigns the user the role 'rules-accepted-role' on pressing "Accept" or 'rules-denied-role' on "Deny" button<br />
			Upon using the button a message is generated privately and shows the current status to the person who pressed it<br />
	- [x]  rulesbutton2: Assigns the user the role 'en-role' on pressing "English" or 'de-role' on "German" button<br />
			Upon using the button a message is generated privately and shows the current status to the person who pressed it<br />
<br />

> [!NOTE] 
> File 'commands.js'<br />

...<br />
<br />

> [!NOTE] 
> File 'embeds.js'<br />
1. GenerateEmbed
   - This allows posting a embed message, depending on what parameters are passed on the embed message is formatted accordingly<br />

2. RulesEmbed
   - This is posting the entirety of the rules set depending on which language has been used in the postrules command<br />

...<br />
<br />

> [!WARNING]
> The Assets folder is for pictures (this is currently in development)<br />
> My idea behind this folder is to upload images in embed messages such as<br />
> Discord Server Icon, Bots Avatars and etc<br />
> The way the bot is written, 5 log channels are required:<br />
> 
> "cmd-log"<br />
> "msg-edited"<br />
> "msg-deleted"<br />
> "user-timeout"<br />
> "user-ban"<br />
<br />

> [!CAUTION]
> It is recommended to save all settings into a json file (settings.json)<br />
> The settings.json file folder should be saved into the folder "Infos"<br />
> All content should be written as text to prevent issues<br />
> The settings.json file should look this like (replace ... with your values):<br />

```
{
	"botToken": "...",
	"botID": "...",
	"serverID": "...",
	"channel-en-id": "...",
	"channel-de-id": "...",
	"rules-accepted-role": "...",
	"rules-denied-role": "...",
	"admin-role-id": "...",
	"moderator-role-id": "...",
	"dev-role-id": "...",
	"member-role": "...",
	"en-role": "...",
	"de-role": "...",
	"log-channel": "...",
	"msg-edit-channel": "...",
	"msg-del-channel": "...",
	"user-timeout-channel": "...",
	"user-ban-channel": "..."
}
```