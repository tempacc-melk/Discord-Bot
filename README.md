# Discord-Bot
> [!IMPORTANT]
> As the bot is currently in development there will be issues and new features (soonTM)<br />
> I only work on this on my free time hence the irregular updates<br />
> The bot hasn't been fully stress tested and might break occasionaly<br />
> Currently there is no mobile support (might add later)<br />

> [!NOTE]
> Uses:<br />
> Discord.js v14.15.2<br />
> node.js v22.14.0<br />
> nodemon v3.1.9<br />
> npm v10.9.2<br >

<h2>How does this bot work?</h2>

> [!CAUTION]
> Follow the procedures below!<br />

Be sure to have Developer Mode enabled in Discord!<br />
-> Open Discord - User Settings - (App Settings) Advanced - Developer Mode -> ENABLE<br />
-> This is required due to the need of channel, role, user, message IDs<br />
<br />
Before you start this Bot make sure that you have all the required modules downloaded and installed<br />
Check that all folders and files are there<br />
-> Folders that you manually need to create: 'Assets' & 'Infos'<br />
<br />
Files that you manually need to create: In 'Infos' -> 'settings.json'<br />
-> Copy the content from the code which is located at the end of readme file into 'settings.json'<br />
<br />
To apply all commands you have to type into a terminal "node src/commands.js" otherwise changes
will not apply! To run the Bot type "node ." into the terminal<br />
<br />
**<ins>I recommend as of now to use Visual Studio Code -> To open a console with the Bot press Ctrl + Shift + C
in a window and there you can type "node ." and close Visual Studio Code</ins>**<br />

<h3>Index.js content</h3>

1. MessageCreate<br />
The bot is checking all written messages for links and is deleting those messages
The same is for all mistyped '/' commands -> unknown commands are deleted, this
includes moderator commands as well<br />

2. MessageUpdate<br />
The bot checks for updated messages, this means once a message has been updated
the previous message are written down in the msg-edited channel<br />

3. MessageDelete<br />
If a message has been deleted the bot is capturing the content and is creating a
copy of this message and writes is down in the msg-deleted channel
The same goes for the deleteMsg command<br />
<br />

> [!TIP]
> Upon executing a slash command a log is automatically created in the log channel<br />
> This is only true for the Moderator Area<br />

4. InteractionCreate
  - Command Interaction<br />
    - Moderator Area<br />
	  - [x] rules: Allows posting each area of the rules with their sub-points<br />
	  - [x] slow-mode: Allows a moderator to enable and disable slow mode in a channel. Duration can be between 0 - 999<br />
	  - [ ] purge: [wip] Cleans a channel from a certain amount of messages. Amount can be between 1 - 999. All messages will be kept in the msg-deleted channel<br />
	  - [x] timeout: Give a user a timeout. <br />
	  - [x] kick: Kick a user from the server<br />
	  - [x] ban: Bans a user from the server<br />
	  - [x] delete: Deletes a message by it's id. An aditional log is being created on successfully deleting the message<br />
 
    - Admin Area<br />
	  - [x] rulesbutton: Creates 2 buttons with different text sets, for the english channel "Accept" and "Deny" for the german one "Annehmen" and "Ablehnen"<br />
	  - [x] rulesbutton2: Creates 2 buttons with different text sets, for the english channel "English" and "German" for the german one "Englisch" and "Deutsch"<br />
	  - [ ] requestplayerbutton: [wip] ...<br />
	  - [x] postmessage: Posts a embed messages<br />
	  - [x] postrules: Posts the entire set of rules for the selected language in the channel id<br />
	  - [x] purgeclean: Cleans a channel from a certain amount of messages. Amount can be between 1 - 999<br />
  
  - Button Interaction<br />
	- [x] rulesbutton: Assigns the user the role 'rules-accepted-role' on pressing "Accept" or 'rules-denied-role' on "Deny" button
			Upon using the button a message is generated privately and shows the current status to the person who pressed it<br />
	- [x] rulesbutton2: Assigns the user the role 'en-role' on pressing "English" or 'de-role' on "German" button
			Upon using the button a message is generated privately and shows the current status to the person who pressed it<br />
	- [ ] requestplayerbutton: [wip] The idea behind this button is to request a "player" role that indicates that the person is owning
			or playing a certain game<br />
<br />

<h3>Commands.js content</h3>

Below you can see all commands that currently exists and can be used<br />
'+' -> required | '-' -> optional<br />
- /rules language(+) number(+) point(+)
- /slow-mode channel(+) duration(+)
- /timeout userid(+) duration(+) format(+) reason(+)
- /kick userid(+) reason(+)
- /delete msgid(+)
- /ban userid(+) reason(+)
- /purge count(+)
- /purgeclean count(+)
- /rulesbutton channel(+) message(+)
- /rulesbutton2 channel(+) message(+)
- /requestplayerbutton channel(+)
- /postmessage channel(+) headline(+) message(+) image(-) calender(-) startdate(-) enddate(-)
- /postrules channel(+) headline(+) language(+)

<h3>Embeds.js content</h3>

1. GenerateEmbed: [wip] This allows posting a embed message, depending on what parameters are passed on and the embed message formatted accordingly<br />
2. RulesEmbed: This is posting the entirety of the rules depending on which language has been selected<br />

<h3>Bot-config.js content</h3>

...<br />

<h2>Future plans</h2>

1. My future plans is the create a enviroment where the person launching this bot can configurate it via writing in a channel or with commands.
   To be more precise - the owner should be allowed to configurate all settings without having coding knowledge.
   There are mulitple options on how to handle it.<br />
   - With Commands: This means all configuration will be handled with commands<br />
   - With text: This means the text inputs in a channel will be scanned and certain keywords will lead to changes in the configuration file<br />
2. A automated moderation system, this means if the bot can detect server rule breaches it should give out warnings and depending on the case even a ban
   Depending on how large the community on the server is and how active the users are I would rather use a database instead of a normal file to track
   all of those informations (warnings, timeouts, kicks, bans, etc.)<br />
3. Allow to give the mod a status and modify it dynamically
4. Create a embed message that allowes to give the user a role depending on reaction/button being pressed


<br />
<br />

<h2>Other Infos</h2>

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
> The settings.json file should look like this (replace ... with your values):<br />

```
{
	"botToken": "...",
	"botID": "...",
	"serverID": "...",
	"ownerID": "...",
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