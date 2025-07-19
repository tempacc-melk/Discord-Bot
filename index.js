const { Client, GatewayIntentBits, Partials, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], 
		partials: [Partials.GuildMember, Partials.Channel, Partials.Message, Partials.Reaction]
	})
const fs = require('fs')
const jsonData = fs.readFileSync ('./Infos/settings.json')
// #region Bot Information
const botToken = JSON.parse(jsonData)['botToken']
const botID = JSON.parse(jsonData)['botID']
// #endregion
// #region Channels
const channelEN = JSON.parse(jsonData)['channel-en-id']
const channelDE = JSON.parse(jsonData)['channel-de-id']
const channelLog = JSON.parse(jsonData)['log-Channel']
const channelMsgEdit = JSON.parse(jsonData)['msg-edit-channel']
const channelMsgDel = JSON.parse(jsonData)['msg-del-channel']
const channelUserTimeout = JSON.parse(jsonData)['user-timeout-channel']
const channelUserBan = JSON.parse(jsonData)['user-ban-channel']
// #endregion
// #region Roles
const rulesAccepted = JSON.parse(jsonData)['rules-accepted-role']
const rulesDenied = JSON.parse(jsonData)['rules-denied-role']
const roleEnglish = JSON.parse(jsonData)['en-role']
const roleGerman = JSON.parse(jsonData)['de-role']
const roleMember = JSON.parse(jsonData)['member-role']
// #endregion
const { generateEmbed, guildLogo, modLogo } = require('./Src/embeds.js')
const deletedMsg = new Set()
// =================================================================================================== //
try {
	client.login(botToken)
} catch (error) {
	return console.log(`Bot login - error\n ${error}`)
}

if (client.isReady) {
	const started = new Date()
	console.log(`Bot Initialized: ${started.toLocaleDateString()} ${started.toLocaleTimeString()}`)
}

// Check all messages if they contain a link or it starts with '/'
client.on("messageCreate", async (message) => {
	if (message.author.bot) return
	//if (message.member.permissions.has ("Administrator"|"Moderator")) return
	const getMsg = message.content
	if (getMsg.startsWith('/')) {
		await castLog (`Mod: <@${botID}> deleted a message, see below.\nUser: <@${message.author.id}>\nMessage: ${getMsg}`, 2)
		deletedMsg.add(message.id)
		if (message.content != "Unknown Message") return await message.delete()
	}
	if (CheckMessageForLinks (message)) {
		await castLog (`Mod: <@${botID}> deleted a message, see below.\nUser: <@${message.author.id}>\nMessage: ${getMsg}`, 2)
		if (message.content != "Unknown Message") return await message.delete()
	}
})
// Check if message has been updated
client.on("messageUpdate", async (message) => {
	if (!CheckMessageForLinks(message)) {
		const targetId = message.author.id
		await castLog (`User: <@${targetId}> updated a message, see below.\nOld Message: ${message.content}`, 1)
	} else {
		await castLog (`Mod: <@${botID}> deleted a message, see below.\nUser: <@${message.author.id}>\nMessage: ${message.content}`, 2)
		return await message.delete()
	}
})
// Check if messages has been deleted
client.on("messageDelete", async (message) => {
	if (deletedMsg.has(message.id)) {
		return deletedMsg.delete(message.id)
	}

	const target = message.author
	//return await castLog (`User: <@${target}> deleted a message, see below.\nMessage: ${message.content}`, 2)
	return await castLog (`User: <${target}> deleted a message, see below.\nMessage: ${message.content}`, 2)
})

// Check for commands
client.on("interactionCreate", async (interaction) => {
    if(interaction.isCommand ()) {
		const getMod = interaction.member.user
		const lUserChannel = interaction.channel.id

		switch (interaction.commandName) {
			// Moderator area
			case "rules":
				await castLog (`<@${getMod.id}> has used /rules in <#${lUserChannel}>`, 0)

				const ruleslanguage = interaction.options.getString("language")
				const rulesEN = fs.readFileSync('Infos/rules-en.info').toString().split('\n')
				const rulesDE = fs.readFileSync('Infos/rules-de.info').toString().split('\n')
				
				const rulesNumber = parseInt(interaction.options.getString("number"))
				const rulesPoint = parseInt(interaction.options.getString("point"))
				const getPointLine = rulesNumber+rulesPoint
				
				if (ruleslanguage === "en") {
					if(rulesNumber === 0) {
						//interaction.reply({ content: `${rulesEN[rulesNumber]}`, ephemeral: false })
						await interaction.reply({ 
							content: `${rulesEN[rulesNumber]}\n${rulesEN[1]}`, 
							ephemeral: false 
						})
					} else if(rulesNumber > 2) {
						if(rulesPoint > 2) {
							await interaction.reply({ 
								content: `${rulesEN[rulesNumber]}\n${rulesEN[getPointLine-1]}`, 
								ephemeral: false 
							})
						} else {
							await interaction.reply({ 
								content: `${rulesEN[rulesNumber]}\n${rulesEN[getPointLine]}`, 
								ephemeral: false 
							})
						}
					} else {
						await interaction.reply({ 
							content: `${rulesEN[rulesNumber]}\n${rulesEN[getPointLine]}`, 
							ephemeral: false 
						})
					}
	
				}
				if (ruleslanguage === "de") {
					await interaction.reply({ 
						content: `${rulesDE[rulesNumber]}\n${rulesDE[getPointLine]}`, 
						ephemeral: false 
					})
	
				}

			break
			case "slow-mode":
				const lChannel = interaction.options.getString("channel")
				const lDuration = interaction.options.getString("duration")
				await castLog (`<@${getMod.id}> has used /slow-mode <#${lChannel}>, duration: ${lDuration} (seconds)`, 0)

				if (lDuration > 0) {
					await interaction.reply({ 
						content: `Slow-mode enabled in channel: <#${lChannel}> for ${lDuration} seconds`, 
						ephemeral: true 
					})
					client.channels.cache.get(lChannel).setRateLimitPerUser(lDuration)
				} else {
					await interaction.reply({ 
						content: `Slow-mode disabled in channel: <#${lChannel}>`, 
						ephemeral: true 
					})
					client.channels.cache.get(lChannel).setRateLimitPerUser(0)
				}
				
			break
			case "purge":
				
			break
			case "purgeclean":
				const pcCount = interaction.options.getString("count")
				try {
					await interaction.channel.bulkDelete(pcCount)
					await interaction.reply({ 
						content: `Deleted messages: ${pcCount}`, 
						ephemeral: true 
					})
				} catch (error) {
					await interaction.reply({ 
						content: `Error during purgeclean: ${pcCount}`, 
						ephemeral: true 
					})
				}
			break
			case "timeout":
				await castLog (`<@${getMod.id}> has used /timeout`, 0)
				
				const tUser = interaction.options.getUser("user")
				if (!CheckRoles(interaction.member, tUser)) {
					return await interaction.reply({ 
						content: `You cannot timeout a user with the same or higher position then yours.`, 
						ephemeral: true 
					})
				} else {
					const lDuration = interaction.options.getInteger("duration")
					const lFormat = interaction.options.getString("format")
					const lReason = interaction.options.getString("reason")
					//const lServerIcon = interaction.guild.icon;
					await interaction.reply({ 
						content: `User ${tUser}` + ` | Timeout time: ${lDuration} ${lFormat} | Reason: ${lReason}`, 
						ephemeral: true 
					})
					
					client.users.send(tUser, `Server: ${interaction.guild.name}\nYou received a timeout for: ${lDuration} ${lFormat}\nReason: ${lReason}`)
					tUser.timeout(ms(10), lReason)

					await castLog (`${tUser} received a timeout from <@${getMod.id}> for ${lDuration} ${lFormat} for ${lReason}`, 3)
				}
			break
			case "kick":
				await castLog (`Mod: <@${getMod.id}> has used /kick`, 0)

				const kUser = interaction.options.getUser("user")
				await interaction.reply({ 
					content: `Kicked user: ${kUser} [wip]`, 
					ephemeral: true 
				})
				await interaction.member.fetch(kUser.id).then(kUser => kUser.kick())

			break
			case "ban":
				await castLog (`Mod: <@${getMod}> has used /ban`, 0)

				const bUser = interaction.options.getUser("user")
				await interaction.reply({ 
					content: `Banned user: ${bUser} [wip]`, 
					ephemeral: true 
				})
			break
			case "delete":
				await castLog (`<@${getMod.id}> has used /delete`, 0)

				const getMsgID = interaction.options.getString("msgid")
				const eaID = getMsgID.split('-')
				try {
					const channel = interaction.client.channels.cache.get(eaID[0])
					if (!channel) {
						return interaction.reply({ 
							content: "Channel not found.", 
							ephemeral: true 
						})
					}

					const msg = await channel.messages.fetch(eaID[1]).catch(err => {
						if (err.code === 10008) {
							return null
						}
						throw err
					})

					if (!msg) {
						return interaction.reply({ 
							content: "The message doesn't exists anymore.", 
							ephemeral: true 
						})
					}

					const modMember = await interaction.guild.members.fetch(getMod.id)
					const targetMember = await interaction.guild.members.fetch(msg.author.id)

					if (!CheckRoles(modMember, targetMember)) {
						return interaction.reply({ 
							content: "The message cannot be deleted, you don't have enough permission.",
							ephemeral: true 
						})
					}
					deletedMsg.add(msg.id)
					await msg.delete()

					await castLog(`Mod: <@${getMod.id}> deleted a message from:\nUser ${msg.author}\nMessage [${msg.content}]`, 2)
					await interaction.reply({ 
						content: "Message has been deleted.", 
						ephemeral: true 
					});

				} catch (error) {
					console.error("Error during deletion:", error)
					if (!interaction.replied) {
						await interaction.reply({ 
							content: "Err during deletion", 
							ephemeral: true 
						})
					}
				}

			break

			// Admin area
			case "rulesbutton":
				if (!interaction.member.roles.highest) {
					return await interaction.reply({ 
						content: "Only the admin can use this function.", 
						ephemeral: true
					})
				}
				const rChannel = interaction.options.getString("channel")
				const lMsg = interaction.options.getString("message")
				let btn1 = "Accept"
				let btn2 = "Deny"

				if (rChannel === "de") {
					btn1 = "Annehmen"
					btn2 = "Ablehnen"
				} 

				const confirm = new ButtonBuilder()
				.setCustomId('confirm')
				.setLabel(btn1)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("✔")

				const cancel = new ButtonBuilder()
				.setCustomId('cancel')
				.setLabel(btn2)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("✖")

				const row = new ActionRowBuilder ()
				.addComponents(confirm,cancel);

				if (rChannel === "en") client.channels.cache.get('1237866586136645652').send({content: lMsg, components: [row]});
				if (rChannel === "de") client.channels.cache.get('1241030993759043585').send({content: lMsg, components: [row]});

				await interaction.reply({ content: "Rules buttons have been added", ephemeral: true})
			break
			case "rulesbutton2":
				if (!interaction.member.roles.highest) {
					return await interaction.reply({ 
						content: "Only the admin can use this function.", 
						ephemeral: true
					})
				}
				const rChannel2 = interaction.options.getString("channel")
				const lMsg2 = interaction.options.getString("message")

				const english = new ButtonBuilder()
				.setCustomId('english')
				.setLabel('English')
				.setStyle(ButtonStyle.Secondary)
	
				const german = new ButtonBuilder()
				.setCustomId('deutsch')
				.setLabel('Deutsch')
				.setStyle(ButtonStyle.Secondary)
	
				const row2 = new ActionRowBuilder ()
				.addComponents(english,german);
	
				if (rChannel2 === "en") client.channels.cache.get('1237866586136645652').send({content: lMsg2, components: [row2]});
				if (rChannel2 === "de") client.channels.cache.get('1241030993759043585').send({content: lMsg2, components: [row2]});

				await interaction.reply({ 
					content: "Language buttons have been added", 
					ephemeral: true
				})
			break
			case "requestplayerbutton":
				if (!interaction.member.roles.highest) {
					return await interaction.reply({ 
						content: "Only the admin can use this function.", 
						ephemeral: true
					})
				}

				await interaction.reply({ 
					content: "Placeholder", 
					ephemeral: true
				})

			break
			case "postmessage":
				if (!interaction.member.roles.highest) {
					return await interaction.reply({ 
						content: "Only the admin can use this function.", 
						ephemeral: true
					})
				}
				const pmheadline = interaction.options.getString("headline")
				const pmname = "Bot name"
				const pmmsg = interaction.options.getString("message")
				await client.channels.cache.get(`${interaction.options.getString("channel")}`).send({
					embeds: [generateEmbed(pmheadline, pmname, pmmsg)],
					files: [guildLogo, modLogo]
				})
				await interaction.reply({ 
					content: "Message has been written.", 
					ephemeral: true
				})
			break
		}
    }
	// Check if a button has been pressed
	if (interaction.isButton()) {
		const lBtn = interaction.customId
		const lUser = interaction.member
		let returnMsg = ""
		let changed = 0
		// Check if the button is "confirm"
		// this is used for the server rules accept button
		if (lBtn === "confirm") {
			if (lUser.roles.cache.has (rulesAccepted)) {
				if (interaction.channelId.match(channelEN)) {
					changed = 11
				} else {
					changed = 12
				}
			} else {
				if (interaction.channelId.match(channelEN)) {
					changed = 1
				} else {
					changed = 10
				}lUser.roles.add(roleMember)
				lUser.roles.add(rulesAccepted)
				lUser.roles.remove(rulesDenied)
			}
		}
		// Check if the button is "cancel"
		// this is used for the server rules deny button
		if (lBtn === "cancel") {
			if (lUser.roles.cache.has (rulesDenied)) {
				if (interaction.channelId.match(channelEN)) {
					changed = 21
				} else {
					changed = 22
				}
			} else {
				if (interaction.channelId.match(channelEN)) {
					changed = 2
				} else {
					changed = 20
				}
				lUser.roles.remove(rulesAccepted)
				lUser.roles.add(rulesDenied)
				lUser.roles.remove(roleEnglish)
				lUser.roles.remove(roleGerman)
			}
		}
		if (lUser.roles.cache.has (rulesAccepted)) {
			if (lBtn === "english") {
				if(lUser.roles.cache.has (roleEnglish)) {
					lUser.roles.remove(roleEnglish)
					changed = 31
				} else {
					lUser.roles.add(roleEnglish)
					changed = 3
				}
			}
			if (lBtn === "deutsch") {
				if (lUser.roles.cache.has (roleGerman)) {
					lUser.roles.remove(roleGerman)
					changed = 41
				} else {
					lUser.roles.add(roleGerman)
					changed = 4
				}
			}
		}

		switch (changed) {
			case 0: 
				returnMsg = "You cannot select a language before accepting the rules."
			break
			case 1:
				returnMsg = "You accepted the server rules, gaining access now."
			break
			case 10:
				returnMsg = "Sie haben die Server Regeln akzeptiert, der Zugang zum Server wird ihnen jetzt gewährt."
			break
			case 11:
				returnMsg = "You already accepted the server rules."
			break
			case 12:
				returnMsg = "Sie haben die Server Regeln bereits akzeptiert."
			break
			case 2:
				returnMsg = "You denied the server rules, removing access now."
			break
			case 20:
				returnMsg = "Sie haben die Server Regeln abgelehnt, der Zugang zum Server wird ihnen jetzt verwährt."
			break
			case 21:
				returnMsg = "You already denied the server rules."
			break
			case 22:
				returnMsg = "Sie haben die Server Regeln bereits abgelehnt."
			break
			case 3:
				returnMsg = "You selected 'English' as your language. Gaining access to english speaking channels."
			break
			case 31:
				returnMsg = "You deselected 'English'. Removing access to english speaking channels."
			break
			case 4:
				returnMsg = "Sie haben 'Deutsch' als Sprache ausgewählt. Sie erhalten Zugang zu deutschsprachigen Kanälen."
			break
			case 41:
				returnMsg = "Sie haben 'Deutsch' als Sprache abgewählt. Der Zugang zu deutschsprachigen Kanälen wird entfernt."
			break
		}

		return await interaction.reply ({ 
			content: returnMsg, 
			ephemeral: true
		})
	}
})

// Check if the userRole (Moderator) and the targetRole
// if the userRole is the owner return true
// if the userRole position is higher then targetRole return true
function CheckRoles (userRole, targetRole) {
	if (userRole.id === userRole.guild.ownerID) return true
	return userRole.roles.highest.position > targetRole.roles.highest.position
}

// Check if the message contains any forms of links with RegExp
// Create array with "http:", "https:" and "www."
// return true if RegExp has found an item from the array
function CheckMessageForLinks (message) {
	const checkForLink = ["http:", "https:", "www."]
	const regex = new RegExp(checkForLink.join( "|" ), "i");

	deletedMsg.add(message.id)
	return regex.test(message)
}

// Create a log message in a certain channel
// Content = message | type = which channel (channel-ID)
async function castLog (content, type) {
	// 0 cmd-log | Hidden channel -> Only visible to owner
	if (type === 0) {
		client.channels.cache.get(channelLog).send(content);
	}
	// 1 msg-edit
	if (type === 1) {
		client.channels.cache.get(channelMsgEdit).send(content);
	}
	// 2 msg-del
	if (type === 2) {
		client.channels.cache.get(channelMsgDel).send({content});
	}
	// 3 user-timeout
	if (type === 3) {
		client.channels.cache.get(channelUserTimeout).send(content);
	}
	// 4 user-ban
	if (type === 4) {
		client.channels.cache.get(channelUserBan).send(content);
	}
}