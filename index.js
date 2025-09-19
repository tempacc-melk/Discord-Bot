const { initializeLaunch, CheckTheDatabase, detectOwnerInput, urlallowlist, } = require('./bot-config.js')
const il = initializeLaunch()
if (il === 0) {
	return console.log (`Something went wrong`)
} else if (il === 1) {
	return console.log ("Settings.json was successfully created - please insert your values into settings.json, then restart the bot.")
}

const { Client, GatewayIntentBits, Partials, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events, MessageFlags } = require('discord.js')
const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent], 
		partials: [Partials.GuildMember, Partials.Channel, Partials.Message, Partials.Reaction]
})

const fs = require('fs')
let jsonData = fs.readFileSync ('./Infos/settings.json', 'utf-8')
const { botToken, botID, ownerID } = JSON.parse(jsonData)
let { channelEN, channelDE, channelLog, channelMsgEdit, channelMsgDel, channelUserTimeout, channelUserBan } = JSON.parse(jsonData)
let { globalLogging, editLogging, delLogging, timeoutLogging, banLogging } = JSON.parse(jsonData)
let { adminRole, memberRole, rulesAccepted, rulesDenied, englishRole, germanRole } = JSON.parse(jsonData)
jsonData = null

let dbUsers, dbInteractions = null
;(async () => { 
	const db = await CheckTheDatabase()
	dbUsers = db.dbUsers
	dbInteractions = db.dbInteractions
})()

const { cmds } = require('./Src/commands.js')
const { generateEmbed, rulesEmbed } = require('./Src/embeds.js')
const deletedMsg = new Set()
// =================================================================================================== //
// Load all commands into the bot
cmds()
// Client login with bot token
client.login(botToken)
// If the client is ready (successfully logged in)
if (client.isReady) {
	console.log(`Bot Initialized: ${rightnow()}`)
}
// =================================================================================================== //
// Check if a user joins the server
client.on(Events.GuildMemberAdd, async (user) => {
	// Check if the user is in the database
	// if not add them to it, otherwise update the current entry	
	const newUser = (await dbUsers.findOne({ 
		where: { 
			UserID: user.id 
		}
	})) === null 
	? async () => {
		await dbUsers.build({ 
			UserID: user.id, 
			Username: user.nickname 
		})

		await newUser.save()
	} 
	: await dbUsers.update({
		RulesAccepted: false,
		Joined: rightnow(),
		Left: null
	}, {
		where: { 
			UserID: user.id 
		}
	})
})
// Check if a user left the server
client.on(Events.GuildMemberRemove, async (user) => {
	await dbUsers.update({ 
		Left: rightnow()
	}, {
		where: { 
			UserID: user.id
		}
	})
})
// Check all messages if they contain a link or it starts with '/' guild owners are excluded
client.on(Events.MessageCreate, async (message) => {
	if (message.author.bot) return
	const getMsg = message.content
	const getAuthor = await message.guild.members.fetch(message.member)
	if (getAuthor.id === ownerID) {
		if (getMsg.toLowerCase().startsWith('scarlet')) {
			const botOutput = detectOwnerInput(getMsg)
			await reply(message, botOutput, "visible")
		}
		return
	}

	if (getMsg.startsWith('/')) {
		await createLog (`<@${botID}> deleted a message, see below.\n${message.member}\n${getMsg}`, 2)
		deletedMsg.add(message.id)
		if (message.content != "Unknown Message") return await message.delete()
	}
	if (CheckMessageForLinks (message)) {
		await createLog (`<@${botID}> deleted a message, see below.\n${message.member}\n${getMsg}`, 2)
		if (message.content != "Unknown Message") return await message.delete()
	}
})
// Check if message has been updated
client.on(Events.MessageUpdate, async (message) => {
	const isPartial = message.partial
	const msgTarget = isPartial ? message.reactions.message.author : message.author
	const messageID = isPartial ? message.reactions.message.id : message.id
	const messageCon = isPartial ? "Err: Message cannot be retrieved" : message.content
	const newMsg = message.reactions.message.content

	if (!CheckMessageForLinks(newMsg)) {
		await createLog (`User: ${msgTarget} updated a message, see below.\nOld Message: ${messageCon}`, 1)
	} else {
		await createLog (`<@${botID}> deleted a message, see below.\n${msgTarget}\n${newMsg}`, 2)
		deletedMsg.add(messageID)
		return await message.delete()
	}
})
// Check if messages has been deleted
client.on(Events.MessageDelete, async (message) => {
	const isPartial = message.partial
	const msgTarget = isPartial ? "Err: User cannot be retrieved" : message.author
	const getMsg = isPartial ? "Err: Message cannot be retrieved" : message.content

	if (deletedMsg.has(message.id)) {
		return deletedMsg.delete(message.id)
	}
	
	return globalLogging ? await createLog (`<@${botID}> caught a deleted message, see below.\n${msgTarget}\n${getMsg}`, 2) : null
})
// Check if a interaction has been created
client.on(Events.InteractionCreate, async (interaction) => {
    // Check if the interaction is a command
	if(interaction.isCommand()) {
		const getMod = interaction.member
		const lUserChannel = interaction.channel.id
		switch (interaction.commandName) {
			// Moderator area
			case "rules":
				await createLog (`${getMod} has used /rules in <#${lUserChannel}>`, 0, { 
					userID: getMod.id, 
					msgID: interaction.id, 
					interaction: "/rules"
				})

				const ruleslanguage = await interaction.options.getString("language")
				const rulesEN = fs.readFileSync('Infos/rules-en.info').toString().split('\n')
				const rulesDE = fs.readFileSync('Infos/rules-de.info').toString().split('\n')
				
				const rulesNumber = parseInt(await interaction.options.getString("number"))
				const rulesPoint = parseInt(await interaction.options.getString("point"))
				const getPointLine = rulesNumber+rulesPoint
				let output = ""
				if (ruleslanguage === "en") {
					if(rulesNumber === 0) {
						output = `${rulesEN[rulesNumber]}\n${rulesEN[1]}`
					} else if(rulesNumber > 2) {
						if(rulesPoint > 2) {
							output = `${rulesEN[rulesNumber]}\n${rulesEN[getPointLine-1]}`
						} else {
							output = `${rulesEN[rulesNumber]}\n${rulesEN[getPointLine]}`
						}
					} else {
						output = `${rulesEN[rulesNumber]}\n${rulesEN[getPointLine]}`
					}
				}
				if (ruleslanguage === "de") {
					if(rulesNumber === 0) {
						output = `${rulesDE[rulesNumber]}\n${rulesDE[1]}`
					} else if(rulesNumber > 2) {
						if(rulesPoint > 2) {
							output = `${rulesDE[rulesNumber]}\n${rulesDE[getPointLine-1]}`
						} else {
							output = `${rulesDE[rulesNumber]}\n${rulesDE[getPointLine]}`
						}
					} else {
						output = `${rulesDE[rulesNumber]}\n${rulesDE[getPointLine]}`
					}
				}

				await reply(interaction, output, "visible")
			break
			case "slow-mode":
				const smChannel = await interaction.options.getString("channel")
				const smDuration = await interaction.options.getInteger("duration")
				await createLog (`${getMod} has used /slow-mode <#${smChannel}>, duration: ${smDuration} (seconds)`, 0, { 
					userID: getMod.id,
					msgID: interaction.id,
					interaction: `/slow-mode ${smDuration}`,
					targetID: smChannel
				})
				const smOutput = smDuration <= 0 ? `Slow-mode disabled in channel: <#${smChannel}>` : `Slow-mode enabled in channel: <#${smChannel}> for ${smDuration} seconds.`;
				
				try {
					await client.channels.cache.get(smChannel).setRateLimitPerUser(smDuration)
				} catch (error) {
					console.log (`[${rightnow()}] Error on slow-mode: ${error}`)
					return await reply(interaction, "Something went wrong with slow-mode. :frowning2:", "hidden")
				}
				await reply(interaction, smOutput, "hidden")
			break
			case "purge":
				const pCount = await interaction.options.getInteger("count")
				await createLog (`${getMod} has used /purge in <#${lUserChannel}>`, 0, { 
					userID: getMod.id,
					msgID: interaction.id,
					interaction: `/purge ${pCount}`,
					targetID: lUserChannel
				})
				
				let pOutput = "Empty"
				await createLog(`${getMod} deleted ${pCount} messages in <#${lUserChannel}>, see below.`, 2)
				try {
					const lastMessages = await interaction.channel.messages.fetch({ limit: pCount })
					lastMessages.forEach(async (msg) => {
						await createLog(`${getMod}\n${msg.author}\n${msg.content}`, 2)
					 })
					await interaction.channel.bulkDelete(pCount)
					pOutput = `Deleted messages: ${pCount}` 
				} catch (error) {
					console.log (`[${rightnow()}] Error on purge: ${error}`)
					return await reply(interaction, "Something went wrong with purge. :frowning2:", "hidden")
				}

				await reply(interaction, pOutput, "hidden")
			break
			case "timeout":
				const tUserID = await interaction.options.getString("userid")
				const tUser = await interaction.guild.members.fetch(tUserID)
				if (!CheckRoles(getMod, { targetRole: tUser })) {
					return await reply(interaction, `You cannot timeout a user with the same or higher position then yours.`, "hidden")
				}
				const lReason = await interaction.options.getString("reason")
				const lDuration = await interaction.options.getInteger("duration")
				const lFormat = await interaction.options.getString("format")
				await createLog (`${getMod} has used /timeout in <#${lUserChannel}> on ${tUser}`, 0, {
					userID: getMod.id,
					msgID: interaction.id,
					interaction: `/timeout ${lDuration} ${lFormat}`,
					targetID: tUserID,
					reason: lReason
				})
				let calculatedTime = 1000
				switch (lFormat) {
					case "days":
						calculatedTime *= 24
					case "hour":
						calculatedTime *= 60
					case "min":
						calculatedTime *= 60
					break
				}
				
				try {
					await tUser.timeout(calculatedTime)
					await tUser.send(`Server: ${interaction.guild.name}\nYou received a timeout for: ${lDuration} ${lFormat}\nReason: ${lReason}`)
				} catch (error) {
					console.log (`[${rightnow()}] Error on timeout: ${error}`)
					return await reply(interaction, "Something went wrong with timeout. :frowning2:", "hidden")
				}

				await reply(interaction, `User has recieved a timeout`, "hidden")
				await createLog (`${tUser} received a timeout from ${getMod}\nTime: ${lDuration} ${lFormat}\nReason: ${lReason}`, 3)
			break
			case "kick":
				const kUserID = await interaction.options.getString("userid")
				const kUser = await interaction.guild.members.fetch(kUserID)
				const kReason = await interaction.options.getString("reason")
				await createLog (`${getMod} has used /kick on ${kUser}`, 0, { 
					userID: getMod.id, 
					msgID: interaction.id,
					interaction: `/kick ${kUserID}`,
					targetID: kUser.id, 
					reason: kReason 
				})
				if (!CheckRoles(getMod, { targetRole: kUser })) { 
					return await reply(interaction, "You cannot kick a user with the same or higher position then yours.", "hidden")
				}
				
				try {
					await kUser.send(`Server: ${interaction.guild.name}\nYou recieved a kick from this server\nReason:${kReason}`)
					await kUser.kick()
				} catch (error) {
					console.log (`[${rightnow()}] Error on kick: ${error}`)
					return await reply(interaction, "Something went wrong with kick. :frowning2:", "hidden")
				}
				
				await reply(interaction, `Kicked user: ${kUser}`, "hidden")
			break
			case "ban":
				const bUserID = await interaction.options.getString("userid")
				const bUser = await interaction.guild.members.fetch(bUserID)
				const bReason = await interaction.options.getString("reason")
				await createLog (`${getMod}> has used /ban on ${bUser}`, 0, {
					userID: getMod.id,
					msgID: interaction.id,
					interaction: `/ban ${bUserID}`,
					targteID: bUserID,
					reason: bReason
				})
				if (!CheckRoles(getMod, { targetRole: bUser })) {
					return await reply(interaction, "You cannot ban a user with the same or higher position then yours.", "hidden") 
				}

				try {
					await bUser.send(bUser, `Server: ${interaction.guild.name}\nYou received a ban.\nReason: ${bReason}`)
					await bUser.ban({ reason: bReason })
				} catch (error) {
					console.log (`[${rightnow()}] Error on ban: ${error}`)
					return await reply(interaction, "Something went wrong with ban. :frowning2:", "hidden");
				}

				await reply(interaction, `Banned user: ${bUser}`, "hidden") 
				await createLog (`${bUser} received a ban from ${getMod}\nReason:${bReason}`, 4)
			break
			case "delete":
				const getMsgID = await interaction.options.getString("msgid")
				const eaID = getMsgID.split('-')
				const channel = interaction.client.channels.cache.get(eaID[0])
				const getMsg = await channel.messages.fetch(eaID[1])
				const targetMember = await interaction.guild.members.fetch(getMsg.author.id)
				await createLog (`${getMod} has used /delete`, 0, {
					userID: getMod.id,
					msgID: interaction.id,
					interaction: `/delete ${getMsgID}`,
					targetID: getMsg.author.id,
				})
				if (!CheckRoles(getMod, { targetRole: targetMember })) {
					return await reply(interaction, "The message cannot be deleted, you don't have enough permission.", "hidden")
				}

				try {
					deletedMsg.add(getMsg.id)
					await getMsg.delete()
				} catch (error) {
					console.log (`[${rightnow()}] Error on delete: ${error}`)
					return await reply(interaction, "Something went wrong with delete. :frowning2:", "hidden")
				}

				await createLog(`${getMod} deleted a message, see below.\n${getMsg.author}\n${getMsg.content}`, 2)
				await reply(interaction, "Message has been deleted.", "hidden")
			break
			
			// Admin area
			case "rulesbutton":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await reply (interaction, "Only an admin can use this function.", "hidden");
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

				const row = new ActionRowBuilder()
				.addComponents(confirm,cancel)

				if (rChannel === "en") client.channels.cache.get(channelEN).send({
					content: lMsg, 
					components: [row]
				})
				if (rChannel === "de") client.channels.cache.get(channelDE).send({
					content: lMsg, 
					components: [row]
				})

				await reply(interaction, "Rules buttons have been added", "hidden")
			break
			case "rulesbutton2":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await reply (interaction, "Only an admin can use this function.", "hidden");
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
	
				const row2 = new ActionRowBuilder()
				.addComponents(english,german)
	
				if (rChannel2 === "en") client.channels.cache.get(channelEN).send({
					content: lMsg2, 
					components: [row2]
				})
				if (rChannel2 === "de") client.channels.cache.get(channelDE).send({
					content: lMsg2, 
					components: [row2]
				})

				await reply(interaction, "Language buttons have been added", "hidden")
			break
			case "requestplayerbutton":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await reply (interaction, "Only an admin can use this function.", "hidden");
				}
				await reply(interaction, "reply", "hidden")
			break
			case "postmessage":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await reply (interaction, "Only an admin can use this function.", "hidden");
				}
				const pmheadline = await interaction.options.getString("headline")
				const pmmsg = await interaction.options.getString("message")
				const pmsendimg = await interaction.options.getString("image")
				const pmcal = await interaction.options.getBoolean("calender")
				const pmstart = await interaction.options.getString("startdate")
				const pmend = await interaction.options.getString("enddate")
				const pmfiles = [guildLogo]
				if (pmsendimg != null) pmfiles.push(guildImage)
				
				await client.channels.cache.get(lUserChannel).send({
					embeds: [generateEmbed(pmheadline, pmmsg, pmsendimg, { pmcal, pmstart, pmend })],
					files: pmfiles
				})
				await reply (interaction, "Message has been written.", "hidden")
			break
			case "postrules":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await reply (interaction, "Only an admin can use this function.", "hidden");
				}
				const prheadline = await interaction.options.getString("headline")
				const prlanguage = await interaction.options.getString("language")
				const prfiles = [guildLogo, guildImage]
								
				await client.channels.cache.get(lUserChannel).send({
					embeds: [rulesEmbed(prheadline, prlanguage)],
					files: prfiles
				})
				await reply (interaction, "Message has been written.", "hidden")
			break
			case "purgeclean":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await reply (interaction, "Only an admin can use this function.", "hidden");
				}
				let pcCount = await interaction.options.getInteger("count")
				let pcOutput = "Empty"
				try {
					const lastMessages = await interaction.channel.messages.fetch({ limit: pcCount })
					lastMessages.forEach(msg => { 
						deletedMsg.add(msg.id) 
					})
					await interaction.channel.bulkDelete(pcCount)
					pcOutput = `Deleted messages: ${pcCount}` 
				} catch (error) {
					console.log (`[${rightnow()}] Error on purgeclean: ${error}`)
					return await reply(interaction, "Something went wrong with purgeclean. :frowning2:", "hidden")
				}
				await reply(interaction, pcOutput, "hidden")
			break
			case "botstatus":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await reply (interaction, "Only an admin can use this function.", "hidden");
				}
				const bsBot = await interaction.options.getInteger("bot")
				const bsType = await interaction.options.getString("type")

				if (bsBot === 0) {
					client.users.cache.get(botID).client.user.setPresence({ status: bsType })
					await reply (interaction, "Set status for 'Scarlet'", "hidden");
				} else if (bsBot === 1) {
					await reply (interaction, "Set status for 'Nova'", "urgent");
				}
			break
			case "botactivity":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await reply (interaction, "Only an admin can use this function.", "hidden");
				}
				const baBot = await interaction.options.getInteger("bot")
				const baType = await interaction.options.getInteger("type")
				const baText = await interaction.options.getString("text")

				if (baBot === 0) {
					if (baText === null) {
						// Removes the activity
						client.users.cache.get(botID).client.user.setActivity()
					} else {
						// Assign Custom text
						client.users.cache.get(botID).client.user.setActivity({ type: baType, name: baText })
					}
					await reply (`Set activity for 'Scarlet'`, "hidden")
				} else if (baBot === 1) {
					await reply (`Set activity for 'Nova'`, "hidden")
				}
			break
			case "reloadsettings":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await reply (interaction, "Only an admin can use this function.", "hidden");
				}
				reload()
				await reply(interaction, "Reloaded all settings", "hidden")
			break
		}
    }
	// Check if the interaction is a button
	if (interaction.isButton()) {
		const lBtn = interaction.customId
		const lUser = interaction.member
		let returnMsg = ""
		let changed = 0
		// Check if the button is "confirm"
		// this is used for the server rules accept button
		if (lBtn === "confirm") {
			if (lUser.roles.cache.has (rulesAccepted)) {
				changed = interaction.channelId.match(channelEN) ? 11 : 12
			} else {
				changed = interaction.channelId.match(channelEN) ? 1 : 10

				lUser.roles.add(memberRole)
				lUser.roles.add(rulesAccepted)
				if (lUser.roles.cache.has(rulesDenied)) lUser.roles.remove(rulesDenied)
			}
		}
		// Check if the button is "cancel"
		// this is used for the server rules deny button
		if (lBtn === "cancel") {
			if (lUser.roles.cache.has (rulesDenied)) {
				changed = interaction.channelId.match(channelEN) ? 21 : 22
			} else {
				changed = interaction.channelId.match(channelEN) ? 2 : 20

				if (lUser.roles.cache.has(rulesAccepted)) lUser.roles.remove(rulesAccepted)
				lUser.roles.add(rulesDenied)
				if (lUser.roles.cache.has(englishRole)) lUser.roles.remove(englishRole)
				if (lUser.roles.cache.has(germanRole)) lUser.roles.remove(germanRole)
			}
		}
		if (lUser.roles.cache.has (rulesAccepted)) {
			if (lBtn === "english") {
				if(lUser.roles.cache.has (englishRole)) {
					lUser.roles.remove(englishRole)
					changed = 31
				} else {
					lUser.roles.add(englishRole)
					changed = 3
				}
			}
			if (lBtn === "deutsch") {
				if (lUser.roles.cache.has (germanRole)) {
					lUser.roles.remove(germanRole)
					changed = 41
				} else {
					lUser.roles.add(germanRole)
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
		return await reply (interaction, returnMsg, "hidden");
	}
})
// Check if a message got a reaction [wip]
client.on(Events.MessageReactionAdd, async (reaction, user) => {
	const isPartial = reaction.partial
	const getReaction = isPartial ? "Reaction could not be detected" : reaction.fetch()

	if (isPartial) {
		return console.log(getReaction)
	} else {
		console.log (`Reaction from: ${reaction.message.author}`)
	}

})
// =================================================================================================== //
// Check if the userRole (Moderator) and the targetRole
// if the userRole is the owner return true
// if the userRole position is higher then targetRole return false
function CheckRoles (userRole, options = {}) {
	if (userRole.user.id === options.targetRole.user.id) {
		// console.log ("Can't use command on yourself")
		return false
	}
	if (options.targetRole.user.id === ownerID) {
		// console.log ("Can't use command on owner of the server")
		return false
	}
	
	return userRole.roles.highest.position > options.targetRole.roles.highest.position
}
// Check if the message contains any forms of links with RegExp
// Create array with "http:", "https:" and "www."
// return true if RegExp has found an item from the array
function CheckMessageForLinks (message) {
	const checkForLink = ["http:", "www."]
	const regex = new RegExp(checkForLink.join( "|" ), "i")
	const checked = regex.test(message)

	// wip
	if (checked) {
		deletedMsg.add(message.id)
	} else {
		if (global.enableUrlAllowlist) {

		}
	}
	return checked
}
// Create a log message in a certain channel or write into a database
// Content = message | type = which channel (channel-ID)
async function createLog (content, type, options = {}) {
	// 0 cmd-log | Hidden channel -> Only visible to owner
	if (type === 0 && globalLogging) {
		if (channelLog === "database") {
			await createDatabaseEntry({
				userID: options.userID,
				msgID: options.msgID,
				interaction: options.interaction,
				targetID: options.targetID,
				reason: options.reason
			})
		} else if (channelLog !== "database" && channelLog.length > 0) {
			try {
				client.channels.cache.get(channelLog).send(content)
			} catch {
				console.log ("Err: Can't pos a message because channel is missing.")
			}
		} else {
			console.log ("Err: Can't post a message because channelLog has a invalid id.")
		}
	}
	// 1 msg-edit
	else if (type === 1 && editLogging) {
		client.channels.cache.get(channelMsgEdit).send(content)
	}
	// 2 msg-del
	else if (type === 2 && delLogging) {
		const msgSplit = content.split('\n')
		if (msgSplit.length === 1) {
			client.channels.cache.get(channelMsgDel).send(msgSplit[0])
		} else if (msgSplit.length > 1) {
			const pmmsg = `${msgSplit[2]}`
			client.channels.cache.get(channelMsgDel).send({ 
				embeds: [generateEmbed(null, `${msgSplit[1]}`, global.guildImageDel.name, { pmmsg })],
				files: [global.guildImageDel]
			})	
		}
	}
	// 3 user-timeout
	else if (type === 3 && timeoutLogging) {
		client.channels.cache.get(channelUserTimeout).send(content)
	}
	// 4 user-ban
	else if (type === 4 && banLogging) {
		client.channels.cache.get(channelUserBan).send(content)
	}
}
// Creates a database entry for each interaction
async function createDatabaseEntry (options = {}) {
	const newInteraction = await dbInteractions.build({
		UserID: options.userID,
		MsgID: options.msgID,
		Interaction: options.interaction,
		Target: options.targetID ? options.targetID.toString() : null,
		InteractionDate: rightnow(),
		Reason: options.reason ? options.reason : null
	})
	await newInteraction.save()
}
// Writes a custom bot reply depending on the type it can be visible
// to others or not
async function reply (object, message, type) {
	const types = {
		visible: { flags: 0 },
		hidden: { flags: MessageFlags.Ephemeral },
		urgent: { flags: MessageFlags.Urgent }
	}
	const config = types[type] || types.hidden

	object.reply({ 
		content: message,
		flags: config.flags
	})
}
// Get current Date in this format: YYYY-MM-DD HH:mm:SS
// Outputs the getdate as a string
function rightnow () {
	let getdate = new Date()
	getdate.setHours(getdate.getHours() + 2)
	getdate = getdate.toISOString().slice(0,19).replace('T',' ')

	return getdate
}
// Reload all variables from the settings file and adjust
function reload () {
	cmds()
	jsonData = fs.readFileSync('./Infos/settings.json', 'utf-8')
	jsonData = JSON.parse(jsonData)

	channelEN = jsonData.channelEN
	channelDE = jsonData.channelDE
	channelLog = jsonData.channelLog
	channelMsgEdit = jsonData.channelMsgEdit
	channelUserTimeout = jsonData.channelUserTimeout
	channelUserBan = jsonData.channelUserBan
	globalLogging = jsonData.globalLogging
	editLogging = jsonData.editLogging
	delLogging = jsonData.delLogging
	timeoutLogging = jsonData.timeoutLogging
	banLogging = jsonData.banlogging
	adminRole = jsonData.adminRole
	memberRole = jsonData.memberRole
	rulesAccepted = jsonData.rulesAccepted
	rulesDenied = jsonData.rulesDenied
	englishRole = jsonData.englishRole
	germanRole = jsonData.germanRole

	jsonData = null
}
// =================================================================================================== //
module.exports = { reload }