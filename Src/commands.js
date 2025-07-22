const { REST, Routes, SlashCommandBuilder } = require("discord.js")
const fs = require('fs');

const jsonData = fs.readFileSync ('./Infos/settings.json')
const botToken = JSON.parse(jsonData)['botToken']
const botID = JSON.parse(jsonData)['botID']
const serverID = JSON.parse(jsonData)['serverID']
// =================================================================== //
const rest = new REST().setToken(botToken)
const cmds = async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(botID, serverID), {
            body : [
                // #region Write with the bot the rules in a channel
                new SlashCommandBuilder()
                .setName("rules")
                .setDescription("Write a rule in this channel")
                .addStringOption(option =>
                    option.setName("language")
                    .setDescription("Select the language of the rules")
                    .addChoices(
                        { name: 'english', value: 'en'},
                        { name: 'deutsch', value: 'de'},
                    )
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("number")
                    .setDescription("Selected the main rule (1-4)")
                    .addChoices(
                        { name: '#1', value: '0'},
                        { name: '#2', value: '2'},
                        { name: '#3', value: '6'},
                        { name: '#4', value: '9'},
                        { name: '#5', value: '12'},
                    )
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("point")
                    .setDescription ("Rule #1: Max 1 | Rule #2: Max 3 | Rule #3-#5: Max 2")
                    .addChoices(
                        { name: '#1', value: '1'},
                        { name: '#2', value: '2'},
                        { name: '#3', value: '3'},
                    )
                    .setRequired(true)
                ),
                // #endregion
                // #region Enable/Disable slow-mode in a channel
                new SlashCommandBuilder()
                .setName("slow-mode")
                .setDescription("Enable a slow mode in the channel")
                .addStringOption(option =>
                    option.setName("channel")
                    .setDescription("In which channel you want to enable slow mode? Post channel id")
                    .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName("duration")
                    .setDescription("Set the duration of the slow mode (1-3 digits) in seconds (0 is off)")
                    .setMinValue(0)
                    .setMaxValue(999)
                    .setRequired(true)
                ),
                // #endregion
                // #region Timeout a user
                new SlashCommandBuilder()
                .setName("timeout")
                .setDescription("Timeout a user from all text and voice channels.")
                .addStringOption(option => 
                    option.setName("userid")
                    .setDescription("Username of the person to timeout")
                    .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName("duration")
                    .setDescription("The duration of the timeout")
                    .setMinValue(1)
                    .setMaxValue(180)
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("format")
                    .setDescription("Decide the format of the duration")
                    .addChoices(
                        { name: 'minutes', value: 'min'},
                        { name: 'hours', value: 'hour'},
                        { name: 'days', value: 'days'},
                    )
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("reason")
                    .setDescription("What was the reason for the timeout")
                    .setRequired(true)
                ),
                // #endregion
                // #region Kick a user
                new SlashCommandBuilder()
                .setName("kick")
                .setDescription("Kick the user from the server")
                .addStringOption(option =>
                    option.setName("userid")
                    .setDescription("Username of the person to be kicked")
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("reason")
                    .setDescription("Add a reason for the kick")
                    .setRequired(true)
                ),
                // #endregion
                // #region Delete a message from a user
                new SlashCommandBuilder()
                .setName("delete")
                .setDescription("Delete a specific message from a user")
                .addStringOption(option =>
                    option.setName("msgid")
                    .setDescription("Insert the message id here")
                    .setRequired(true)
                ),
                // #endregion
                // #region Ban a user
                new SlashCommandBuilder()
                .setName("ban")
                .setDescription("Ban a person from this server")
                .addStringOption(option =>
                    option.setName("userid")
                    .setDescription("Insert their user ID here")
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("reason")
                    .setDescription("What is the reason for banning this person?")
                    .setRequired(true)
                ),
                // #endregion
                // #region Purge a channel from certain amount of messages
                new SlashCommandBuilder()
                .setName("purge")
                .setDescription("Delete multiple messages in channel")
                .addIntegerOption(option =>
                    option.setName("count")
                    .setDescription("How many messages do you want to delete")
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true)
                ),
                // #endregion
                // #region Purge a channel from certain amount of messages without leaving logs
                new SlashCommandBuilder()
                .setName("purgeclean")
                .setDescription("Delete multiple messages in channel with a log")
                .addIntegerOption(option =>
                    option.setName("count")
                    .setDescription("How many messages do you want to delete")
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true)
                ),
                // #endregion
                
                // Owner only area (disable later!)
                // #region Rules buttons
                new SlashCommandBuilder()
                .setName("rulesbutton")
                .setDescription("Add 'accept' and 'deny' button")
                .addStringOption(option =>
                    option.setName("channel")
                    .setDescription("Select in which channel you want to add the buttons")
                    .addChoices(
                        { name: "readme", value: "en" },
                        { name: "readme-de", value: "de" },
                    )
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("message")
                    .setDescription("Add a bot message to the buttons")
                    .setRequired(true)
                ),
                // #endregion
                // #region Language buttons
                new SlashCommandBuilder()
                .setName("rulesbutton2")
                .setDescription("Add 'english' and 'deutsch' button")
                .addStringOption(option =>
                    option.setName("channel")
                    .setDescription("Select in which channel you want to add the buttons")
                    .addChoices(
                        { name: "readme", value: "en" },
                        { name: "readme-de", value: "de" },
                    )
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("message")
                    .setDescription("Add a bot message to the buttons")
                    .setRequired(true)
                ),
                // #endregion
                // #region Request 'Player' role button
                new SlashCommandBuilder()
                .setName("requestplayerbutton")
                .setDescription("Add a request 'Player' role button")
                .addStringOption(option =>
                    option.setName("channel")
                    .setDescription("Select in which channel you want to add the button")
                    .addChoices(
                        { name: "Contact-mods", value: "en" },
                        { name: "Kontaktiere-Mods", value: "de" },
                    )
                    .setRequired(true)
                ),
                // #endregion
                // #region Postmessage
                new SlashCommandBuilder()
                .setName("postmessage")
                .setDescription("Post a message from file")
                .addStringOption(option =>
                    option.setName("channel")
                    .setDescription("Select the channel id")
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("headline")
                    .setDescription("The Headline for the embed message")
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("message")
                    .setDescription("What should the bot write for you")
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("image")
                    .setDescription("Add Image to the embed message")
                    .setRequired(false)
                )
                .addBooleanOption(option =>
                    option.setName("calender")
                    .setDescription("Add Calender to the embed message")
                    .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName("startdate")
                    .setDescription("Set a start time for a event (Insert TIMESTAMP) [wip]")
                    .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName("enddate")
                    .setDescription("Set a end time for a event( Insert TIMESTAMP) [wip]")
                    .setRequired(false)
                ),
                // #endregion
                // #region Postrules
                new SlashCommandBuilder()
                .setName("postrules")
                .setDescription("Post a message from file")
                .addStringOption(option =>
                    option.setName("channel")
                    .setDescription("Select the channel id")
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("headline")
                    .setDescription("The Headline for the embed message")
                    .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("language")
                    .setDescription("What should the bot write for you")
                    .addChoices(
                        { name: "English", value: "rules-en.info" },
                        { name: "German", value: "rules-en.info" }
                    )
                    .setRequired(true)
                ),
                // #endregion
            ]
        })
    } catch (error) {
        console.error(error)
    }
}
cmds();