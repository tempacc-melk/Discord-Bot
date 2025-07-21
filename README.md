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

<h2>Infos regarding the bot</h2>

> [!NOTE] 
> File 'index.js'<br />

1. MessageCreate<br />
The bot is checking all written messages for links and is deleting those messages<br />
The same is for all mistyped '/' commands -> unknown commands are deleted, this<br />
includes moderator commands as well

2. MessageUpdate<br />
The deleted messages are written down in the msg-deleted channel<br />
The bot also checks for updated messages, this means once a message has been updated<br />
the previous message are written down in the msg-edited channel

3. MessageDelete<br />
If a message has been deleted the bot is capturing the content and is creating a<br />
copy of this message and writes is down in the msg-deleted channel<br />
The same goes for the deleteMsg command<br />

4. InteractionCreate
  - Command Interaction<br />
    - Moderator Area<br />
   
	  - [ ] rules:[wip]<br />
	  - [x] slow-mode: <br />
	  - [ ] purge:[wip]<br />
	  - [x] timeout: Give a user a timeout<br />
	  - [x] kick: Kick a user from the server<br />
	  - [x] ban: Bans a user from the server<br />
	  - [x] delete: Deletes a message by it's id<br />
 
    - Admin Area<br />
 
	  - [ ]  rulesbutton:<br />
	  - [ ]  rulesbutton2:<br />
	  - [ ]  requestplayerbutton:<br />
	  - [x]  postmessage:<br />
	  - [x]  purgeclean:<br />
  
  - Button Interaction<br />
	 - ...<br />
<br />
<br />

> [!NOTE] 
> File 'commands.js'<br />

...<br />
<br />

> [!NOTE] 
> File 'embed.js'<br />

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
	"botToken": "...",<br />
	"botID": "...",<br />
	"serverID": "...",<br />
	"channel-en-id": "...",<br />
	"channel-de-id": "...",<br />
	"rules-accepted-role": "...",<br />
	"rules-denied-role": "...",<br />
	"admin-role-id": "...",<br />
	"moderator-role-id": "...",<br />
	"dev-role-id": "...",<br />
	"member-role": "...",<br />
	"en-role": "...",<br />
	"de-role": "...",<br />
	"log-channel": "...",<br />
	"msg-edit-channel": "...",<br />
	"msg-del-channel": "...",<br />
	"user-timeout-channel": "...",<br />
	"user-ban-channel": "..."<br />
}
```