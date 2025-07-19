# Discord-Bot
Uses:<br />
Discord.js v14.15.2<br />
node.js v22.14.0<br />
nodemon v3.1.9<br />
<br />
Other Infos:<br />
!!! [IMPORTANT] !!!<br />
As the bot is currently in development there will be issues and new features (soonTM)<br />
I only work on this on my free time hence the irregular updates<br />
The bot hasn't been fully stress tested and might break occasionaly<br />
Currently there is no mobile support (might add later)<br />
<br />
Infos regarding the bot:<br />
[MessageCreate]<br />
The bot is checking all written messages for links and is deleting those messages<br />
The same is for all mistyped '/' commands -> unknown commands are deleted, this<br />
includes moderator commands as well<br />
[MessageUpdate]<br />
The deleted messages are written down in the msg-deleted channel<br />
The bot also checks for updated messages, this means once a message has been updated<br />
the previous message are written down in the msg-edited channel<br />
[MessageDelete]<br />
If a message has been deleted the bot is capturing the content and is creating a<br />
copy of this message and writes is down in the msg-deleted channel<br />
The same goes for the deleteMsg command<br />
[InteractionCreate]<br />
->[ModeratorCommands]<br />
  ...<br />
->[OwnerCommands]<br />
  ...<br />
->[ButtonIsPressed]<br />
  ...<br />
<br />
<br />
The Asset folder is for pictures (this is currently in development)<br />
My idea behind this folder is to upload images in embed messages such as<br />
Discord Server Icon, Bots Avatars and etc<br />
<br />
The way the bot is written, log channels are required, 5 in total:<br />
"cmd-log"<br />
"msg-edited"<br />
"msg-deleted"<br />
"user-timeout"<br />
"user-ban"<br />
<br />
It is recommended to save all settings into a json file (settings.json)<br />
The settings.json file folder should be saved into the folder "Infos"<br />
All content should be written as text to prevent issues<br />
<br />
The settings.json file should look this like (replace ... with your values):<br />
<br />
{<br />
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
}<br />