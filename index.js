const { initializeLaunch, CheckTheDatabase, detectOwnerInput, urlallowlist, } = require('./bot-config.js')
const il = initializeLaunch()
if (il === 0) {
	return console.log (`Something went wrong`)
} else if (il === 1) {
	return console.log ("Settings.json was successfully created - please insert your values then restart the bot")
}

const { Client, GatewayIntentBits, Partials, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events, MessageFlags } = require('discord.js')
const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent], 
		partials: [Partials.GuildMember, Partials.Channel, Partials.Message, Partials.Reaction]
})

const fs = require('fs')
let jsonData = fs.readFileSync ('./Infos/settings.json', 'utf-8')
const { botToken, botID, ownerRole } = JSON.parse(jsonData)
let { channelEN, channelDE, channelLog, channelMsgEdit, channelMsgDel, channelUserTimeout, channelUserBan } = JSON.parse(jsonData)
let { globalLogging, loggingFormat, editLogging, delLogging, timeoutLogging, banLogging } = JSON.parse(jsonData)
let { adminRole, memberRole, rulesAccepted, rulesDenied, englishRole, germanRole } = JSON.parse(jsonData)
const { cmds } = require('./Src/commands.js')
const { generateEmbed, rulesEmbed } = require('./Src/embeds.js')
const deletedMsg = new Set()
jsonData = null
// =================================================================================================== //
cmds()

client.login(botToken)

if (client.isReady) {
	const started = new Date()
	console.log(`Bot Initialized: ${started.toLocaleDateString()} ${started.toLocaleTimeString()}`)
	CheckTheDatabase()
}

// Check if a user joins the server
client.on(Events.GuildMemberAdd, async (user) => {
	// Check if the user is in the database
	// if not add them to it, otherwise ignore
	const userID = user.id
	
	Console.log(`User joined the server: ${userID}`)
})
// Check all messages if they contain a link or it starts with '/' guild owners are excluded
client.on(Events.MessageCreate, async (message) => {
	if (message.author.bot) return
	const getMsg = message.content
	const getAuthor = await message.guild.members.fetch(message.member)
	if (getAuthor.id === ownerRole) {
		if (getMsg.toLowerCase().startsWith('scarlet')) {
			const botOutput = detectOwnerInput(getMsg)
			await message.reply({
				content: botOutput
			})
		}
		return
	}

	if (getMsg.startsWith('/')) {
		await castLog (`<@${botID}> deleted a message, see below.\n${message.member}\n${getMsg}`, 2)
		deletedMsg.add(message.id)
		if (message.content != "Unknown Message") return await message.delete()
	}
	if (CheckMessageForLinks (message)) {
		await castLog (`<@${botID}> deleted a message, see below.\n${message.member}\n${getMsg}`, 2)
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
		await castLog (`User: ${msgTarget} updated a message, see below.\nOld Message: ${messageCon}`, 1)
	} else {
		await castLog (`<@${botID}> deleted a message, see below.\n${msgTarget}\n${newMsg}`, 2)
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

	return await castLog (`<@${botID}> caught a deleted message, see below.\n${msgTarget}\n${getMsg}`, 2)
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
				if (globalLogging) await castLog (`${getMod} has used /rules in <#${lUserChannel}>`, 0)

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

				await interaction.reply({ content: output })
			break
			case "slow-mode":
				const smChannel = await interaction.options.getString("channel")
				let smDuration = await interaction.options.getInteger("duration")
				if (globalLogging) await castLog (`${getMod} has used /slow-mode <#${smChannel}>, duration: ${smDuration} (seconds)`, 0)
				let smOutput = ""
				
				try {
					await client.channels.cache.get(smChannel).setRateLimitPerUser(smDuration)
				} catch (error) {
					const timer = new Date()				
					console.log (`[${timer.toLocaleDateString()} ${timer.toLocaleTimeString()}] Error on slow-mode: ${error}`)
					return await interaction.reply({ 
						content: "Something went wrong with slow-mode. :frowning2:", 
						flags: MessageFlags.Ephemeral
					})
				}

				if (smDuration <= 0) smOutput = `Slow-mode disabled in channel: <#${smChannel}>`
				else smOutput= `Slow-mode enabled in channel: <#${smChannel}> for ${smDuration} seconds.`
				
				await interaction.reply({ 
					content: smOutput, 
					flags: MessageFlags.Ephemeral 
				})
			break
			case "purge":
				if (globalLogging) await castLog (`${getMod} has used /purge in <#${lUserChannel}>`, 0)
				
				let pCount = await interaction.options.getInteger("count")
				let pOutput = "Empty"
				if (globalLogging) castLog(`${getMod} deleted ${pCount} messages in <#${lUserChannel}>, see below.`, 2)
				try {
					const lastMessages = await interaction.channel.messages.fetch({ limit: pCount })
					lastMessages.forEach(msg => {
						if (globalLogging) castLog(`${getMod}\n${msg.author}\n${msg.content}`, 2)
					 })
					await interaction.channel.bulkDelete(pCount)
					pOutput = `Deleted messages: ${pCount}` 
				} catch (error) {
					const timer = new Date()
					console.log (`[${timer.toLocaleDateString()} ${timer.toLocaleTimeString()}] Error on purge: ${error}`)
					return await interaction.reply({ 
						content: "Something went wrong with purge. :frowning2:", 
						flags: MessageFlags.Ephemeral
					})
				}

				await interaction.reply({ 
					content: pOutput, 
					flags: MessageFlags.Ephemeral
				})
			break
			case "timeout":
				const tUser = await interaction.guild.members.fetch(interaction.options.getString("userid"))
				if (globalLogging) await castLog (`${getMod} has used /timeout in <#${lUserChannel}> on ${tUser}`, 0)
				const tcrID = CheckRoles(getMod, { targetRole: tUser })
				if(!tcrID) {
					return await interaction.reply({ 
						content: `You cannot timeout a user with the same or higher position then yours.`, 
						flags: MessageFlags.Ephemeral 
					})
				} else {
					const lDuration = await interaction.options.getInteger("duration")
					const lFormat = await interaction.options.getString("format")
					const lReason = await interaction.options.getString("reason")
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
						await tUser.timeout(calculatedTime, lReason)
						await tUser.send(`Server: ${interaction.guild.name}\nYou received a timeout for: ${lDuration} ${lFormat}\nReason: ${lReason}`)
					} catch (error) {
						const timer = new Date()
						console.log (`[${timer.toLocaleDateString()} ${timer.toLocaleTimeString()}] Error on timeout: ${error}`)
						return await interaction.reply({ 
							content: "Something went wrong with timeout. :frowning2:",  
							flags: MessageFlags.Ephemeral 
						})
					}
					await interaction.reply({ 
						content: `User has recieved a timeout`, 
						flags: MessageFlags.Ephemeral 
					})
					if (globalLogging) await castLog (`${tUser} received a timeout from ${getMod}\nTime: ${lDuration} ${lFormat}\nReason: ${lReason}`, 3)
				}
			break
			case "kick":
				const kUser = await interaction.guild.members.fetch(interaction.options.getString("userid"))
				if (globalLogging) await castLog (`${getMod} has used /kick on ${kUser}`, 0)
				const kReason = await interaction.options.getString("reason")
				const kcrID = CheckRoles(getMod, { targetRole: kUser })
				if (!kcrID) {
					return interaction.reply({ 
						content: "You cannot kick a user with the same or higher position then yours.",
						flags: MessageFlags.Ephemeral 
					})
				}
				try {
					await kUser.send(kUser, `Server: ${interaction.guild.name}\nYou recieved a kick from this server\nReason:${kReason}`)
					await kUser.kick()
				} catch (error) {
					const timer = new Date()
					console.log (`[${timer.toLocaleDateString()} ${timer.toLocaleTimeString()}] Error on kick: ${error}`)
					return await interaction.reply({ 
						content: "Something went wrong with kick. :frowning2:",  
						flags: MessageFlags.Ephemeral 
					})				
				}
				
				await interaction.reply({ 
					content: `Kicked user: ${kUser}`, 
					flags: MessageFlags.Ephemeral 
				})
			break
			case "ban":
				const bUser = await interaction.guild.members.fetch(interaction.options.getString("userid"))
				if (globalLogging) await castLog (`${getMod}> has used /ban on ${bUser}`, 0)
				const bReason = await interaction.options.getString("reason")
				const bcrID = CheckRoles(getMod, { targetRole: bUser })
				if (!bcrID) {
					return interaction.reply({ 
						content: "You cannot ban a user with the same or higher position then yours.",
						flags: MessageFlags.Ephemeral 
					})
				}
				try {
					await bUser.send(bUser, `Server: ${interaction.guild.name}\nYou received a ban.\nReason: ${bReason}`)
					await bUser.ban( { reason: bReason })
				} catch (error) {
					const timer = new Date()
					console.log (`[${timer.toLocaleDateString()} ${timer.toLocaleTimeString()}] Error on ban: ${error}`)
					return await interaction.reply({ 
						content: "Something went wrong with ban. :frowning2:",  
						flags: MessageFlags.Ephemeral 
					})
				}

				await interaction.reply({ 
					content: `Banned user: ${bUser}`, 
					flags: MessageFlags.Ephemeral 
				})
				if (globalLogging) await castLog (`${bUser} received a ban from ${getMod}\nReason:${bReason}`, 4)
			break
			case "delete":
				if (globalLogging) await castLog (`${getMod} has used /delete`, 0)

				const getMsgID = await interaction.options.getString("msgid")
				const eaID = getMsgID.split('-')
				const channel = interaction.client.channels.cache.get(eaID[0])
				const getMsg = await channel.messages.fetch(eaID[1])
				const targetMember = await interaction.guild.members.fetch(getMsg.author.id)
				const dcrID = CheckRoles(getMod, { targetRole: targetMember })
				if (!dcrID) {
					return interaction.reply({ 
						content: "The message cannot be deleted, you don't have enough permission.",
						flags: MessageFlags.Ephemeral 
					})
				}

				try {
					deletedMsg.add(getMsg.id)
					await getMsg.delete()
				} catch (error) {
					const timer = new Date()				
					console.log (`[${timer.toLocaleDateString()} ${timer.toLocaleTimeString()}] Error on delete: ${error}`)
					return await interaction.reply({ 
						content: "Something went wrong with delete. :frowning2:", 
						flags: MessageFlags.Ephemeral 
					})
				}

				if (globalLogging) await castLog(`${getMod} deleted a message, see below.\n${getMsg.author}\n${getMsg.content}`, 2)
				await interaction.reply({ 
					content: "Message has been deleted.", 
					flags: MessageFlags.Ephemeral 
				})
			break
			
			// Admin area
			case "rulesbutton":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await interaction.reply({ 
						content: "Only a admin can use this function.", 
						flags: MessageFlags.Ephemeral
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

				await interaction.reply({ 
					content: "Rules buttons have been added", 
					flags: MessageFlags.Ephemeral
				})
			break
			case "rulesbutton2":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await interaction.reply({ 
						content: "Only a admin can use this function.", 
						flags: MessageFlags.Ephemeral
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

				await interaction.reply({ 
					content: "Language buttons have been added", 
					flags: MessageFlags.Ephemeral
				})
			break
			case "requestplayerbutton":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await interaction.reply({ 
						content: "Only a admin can use this function.", 
						flags: MessageFlags.Ephemeral
					})
				}

				await interaction.reply({ 
					content: "Placeholder", 
					flags: MessageFlags.Ephemeral
				})

			break
			case "postmessage":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await interaction.reply({ 
						content: "Only a admin can use this function.", 
						flags: MessageFlags.Ephemeral
					})
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
					embeds: [generateEmbed(pmheadline, pmmsg, pmsendimg, {pmcal, pmstart, pmend})],
					files: pmfiles
				})
				await interaction.reply({ 
					content: "Message has been written.", 
					flags: MessageFlags.Ephemeral
				})
			break
			case "postrules":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await interaction.reply({ 
						content: "Only the admin can use this function.", 
						flags: MessageFlags.Ephemeral
					})
				}
				
				const prheadline = await interaction.options.getString("headline")
				const prlanguage = await interaction.options.getString("language")
				const prfiles = [guildLogo, guildImage]
								
				await client.channels.cache.get(lUserChannel).send({
					embeds: [rulesEmbed(prheadline, prlanguage)],
					files: prfiles
				})
				await interaction.reply({ 
					content: "Message has been written.", 
					flags: MessageFlags.Ephemeral
				})
			break
			case "purgeclean":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await interaction.reply({ 
						content: "Only a admin can use this function.", 
						flags: MessageFlags.Ephemeral
					})
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
					const timer = new Date()
					console.log (`[${timer.toLocaleDateString()} ${timer.toLocaleTimeString()}] Error on purgeclean: ${error}`)
					return await interaction.reply({ 
						content: "Something went wrong with purgeclean. :frowning2:", 
						flags: MessageFlags.Ephemeral 
					})
				}
				
				await interaction.reply({ 
					content: pcOutput, 
					flags: MessageFlags.Ephemeral 
				})
			break
			case "botstatus":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await interaction.reply({ 
						content: "Only a admin can use this function.", 
						flags: MessageFlags.Ephemeral
					})
				}

				const bsBot = await interaction.options.getInteger("bot")
				const bsType = await interaction.options.getString("type")

				if (bsBot === 0) {
					client.users.cache.get(botID).client.user.setPresence({ status: bsType })
					await interaction.reply({ 
						content: `Set status for 'Scarlet'`, 
						flags: MessageFlags.Ephemeral
					})
				} else if (bsBot === 1) {
					await interaction.reply({ 
						content: `Set status for 'Nova'`, 
						flags: MessageFlags.Ephemeral
					})
				}
			break
			case "botactivity":
				if (!interaction.member.roles.cache.has(adminRole)) {
					return await interaction.reply({ 
						content: "Only a admin can use this function.", 
						flags: MessageFlags.Ephemeral
					})
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
					await interaction.reply({ 
						content: `Set activity for 'Scarlet'`, 
						flags: MessageFlags.Ephemeral
					})
				} else if (baBot === 1) {
					await interaction.reply({ 
						content: `Set activity for 'Nova'`, 
						flags: MessageFlags.Ephemeral
					})
				}

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
				lUser.roles.remove(rulesDenied)
			}
		}
		// Check if the button is "cancel"
		// this is used for the server rules deny button
		if (lBtn === "cancel") {
			if (lUser.roles.cache.has (rulesDenied)) {
				changed = interaction.channelId.match(channelEN) ? 21 : 22
			} else {
				changed = interaction.channelId.match(channelEN) ? 2 : 20

				lUser.roles.remove(rulesAccepted)
				lUser.roles.add(rulesDenied)
				lUser.roles.remove(englishRole)
				lUser.roles.remove(germanRole)
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

		return await interaction.reply ({ 
			content: returnMsg, 
			flags: MessageFlags.Ephemeral
		})
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

// Check if the userRole (Moderator) and the targetRole
// if the userRole is the owner return true
// if the userRole position is higher then targetRole return false
function CheckRoles (userRole, options = {}) {
	if (userRole.user.id === ownerRole) return true
	if (options.targetRole.user.id == ownerRole) return false
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
// Create a log message in a certain channel
// Content = message | type = which channel (channel-ID)
async function castLog (content, type) {
	// 0 cmd-log | Hidden channel -> Only visible to owner
	if (type === 0) {
		client.channels.cache.get(channelLog).send(content)
	}
	// 1 msg-edit
	if (type === 1) {
		client.channels.cache.get(channelMsgEdit).send(content)
	}
	// 2 msg-del
	if (type === 2) {
		const msgSplit = content.split('\n')
		if (msgSplit.length === 1) {
			client.channels.cache.get(channelMsgDel).send(msgSplit[0])
		} else if (msgSplit.length > 1) {
			const pmmsg = `${msgSplit[2]}`
			//client.channels.cache.get(channelMsgDel).send(msgSplit[0])
			client.channels.cache.get(channelMsgDel).send({ 
				embeds: [generateEmbed(null, `${msgSplit[1]}`, global.guildImageDel.name, { pmmsg })],
				files: [global.guildImageDel]
			})	
		}
	}
	// 3 user-timeout
	if (type === 3) {
		client.channels.cache.get(channelUserTimeout).send(content)
	}
	// 4 user-ban
	if (type === 4) {
		client.channels.cache.get(channelUserBan).send(content)
	}
}

function reload () {
	jsonData = fs.readFileSync('./Infos/settings.json', 'utf-8')
	jsonData = JSON.parse(jsonData)

	channelEN = jsonData.channelEN
	channelDE = jsonData.channelDE
	channelLog = jsonData.channelLog
	channelMsgEdit = jsonData.channelMsgEdit
	channelUserTimeout = jsonData.channelUserTimeout
	channelUserBan = jsonData.channelUserBan
	globalLogging = jsonData.globalLogging
	loggingFormat = jsonData.loggingFormat
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

module.exports = { reload }