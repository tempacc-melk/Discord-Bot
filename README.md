# Discord-Bot
Uses:<br />
Discord.js v14.15.2<br />
node.js v22.14.0<br />
nodemon v3.1.9<br />

Other Infos:
!!! [IMPORTANT] !!!
As the bot is currently in development there will be issues and new features (soonTM)
I only work on this on my free time hence the irregular updates
The bot hasn't been fully stress tested and might break occasionaly
Currently there is no mobile support (might add later)

Infos regarding the bot:
[MessageCreate]
The bot is checking all written messages for links and is deleting those messages
The same is for all mistyped '/' commands -> unknown commands are deleted, this
includes moderator commands as well
[MessageUpdate]
The deleted messages are written down in the msg-deleted channel
The bot also checks for updated messages, this means once a message has been updated
the previous message are written down in the msg-edited channel
[MessageDelete]
If a message has been deleted the bot is capturing the content and is creating a
copy of this message and writes is down in the msg-deleted channel
The same goes for the deleteMsg command
[InteractionCreate]
->[ModeratorCommands]
  ...
->[OwnerCommands]
  ...
->[ButtonIsPressed]
  ...


The Asset folder is for pictures (this is currently in development)
My idea behind this folder is to upload images in embed messages such as
Discord Server Icon, Bots Avatars and etc

The way the bot is written, log channels are required, 5 in total:
"cmd-log"
"msg-edited"
"msg-deleted"
"user-timeout"
"user-ban"

It is recommended to save all settings into a json file (settings.json)
The settings.json file folder should be saved into the folder "Infos"
All content should be written as text to prevent issues

The settings.json file should look this like (replace ... with your values):

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