const { REST, Routes, SlashCommandBuilder } = require("discord.js")
const fs = require('fs')

const jsonData = fs.readFileSync ('./Infos/settings.json')
const { botToken, botID, serverID } = JSON.parse(jsonData)
// =================================================================== //
const rest = new REST().setToken(botToken)
const cmds = async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(botID, serverID), {
            body : [
                // #region Write with the bot the rules in a channel
                new SlashCommandBuilder()
                .setName("rules")
                .setNameLocalizations({
                    de: "regeln"
                })
                .setDescription("Write a rule in this channel")
                .setDescriptionLocalizations({
                    de: "Schreibe eine Regel in den aktuellen Channel"
                })
                .addStringOption(option => option
                    .setName("language")
                    .setNameLocalizations({
                        de: "sprache"
                    })
                    .setDescription("Select the language for the output")
                    .setDescriptionLocalizations({
                        de: "Wähle eine Sprache für die Ausgabe aus"
                    })
                    .addChoices(
                        { name: 'english', value: 'en'},
                        { name: 'deutsch', value: 'de'},
                    )
                    .setRequired(true)
                )
                .addIntegerOption(option => option
                    .setName("number")
                    .setNameLocalizations({
                        de: "nummer"
                    })
                    .setDescription("Selected the main rule (1 to 4)")
                    .setDescriptionLocalizations({
                        de: "Wählen Sie eine Hauptregeln aus (1 bis 4)"
                    })
                    .addChoices(
                        { name: '#1', value: 0 },
                        { name: '#2', value: 2 },
                        { name: '#3', value: 6 },
                        { name: '#4', value: 9 },
                        { name: '#5', value: 12 },
                    )
                    .setRequired(true)
                )
                .addIntegerOption(option => option
                    .setName("point")
                    .setNameLocalizations({
                        de: "punkt"
                    })
                    .setDescription ("Rule #1: Max 1 | Rule #2: Max 3 | Rule #3 to #5: Max 2")
                    .setDescriptionLocalizations({
                        de: "Regeln #1: Max 1 | Regeln #2: Max 3 | Regeln #3 bis #5: Max 2"
                    })
                    .addChoices(
                        { name: '#1', value: 1 },
                        { name: '#2', value: 2 },
                        { name: '#3', value: 3 },
                    )
                    .setRequired(true)
                ),
                // #endregion
                // #region Enable/Disable slow-mode in a channel
                new SlashCommandBuilder()
                .setName("slow-mode")
                .setDescription("Enable or disable a slow-mode in the channel")
                .setDescriptionLocalizations({
                    de: "Aktiviere oder deaktiviere den slow-mode in diesen Kannal"
                })
                .addIntegerOption(option => option
                    .setName("duration")
                    .setNameLocalizations({
                        de: "dauer"
                    })
                    .setDescription("Set the duration of the slow-mode (1-3 digits) in seconds (0 is off)")
                    .setDescriptionLocalizations({
                        de: "Gebe die Dauer für den slow-mode in Sekunden (1-3 Zahlen) an (0 ist aus)"
                    })
                    .setMinValue(0)
                    .setMaxValue(999)
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("channel")
                    .setNameLocalizations({
                        de: "kannal"
                    })
                    .setDescription("In which channel you want to enable/disable slow-mode? Post channel id")
                    .setDescriptionLocalizations({
                        de: "In welchen Kannal möchten Sie den slow-mode aktivieren/deaktivieren? Gebe Kannal ID ein"
                    })
                    .setRequired(false)
                ),
                // #endregion
                // #region Timeout a user
                new SlashCommandBuilder()
                .setName("timeout")
                .setDescription("Timeout a user from all text and voice channels.")
                .setDescriptionLocalizations({
                    de: "Setze einen Benutzer für alle Text und Voice Kannäle in den Timeout"
                })
                .addStringOption(option => option
                    .setName("userid")
                    .setNameLocalizations({
                        de: "benutzerid"
                    })
                    .setDescription("Insert the user id of the person")
                    .setDescriptionLocalizations({
                        de: "Gebe die Benutzer ID der Person ein"
                    })
                    .setRequired(true)
                )
                .addIntegerOption(option => option
                    .setName("duration")
                    .setNameLocalizations({
                        de: "dauer"
                    })
                    .setDescription("The duration of the timeout")
                    .setDescriptionLocalizations({
                        de: "Die Dauer des Timeouts"
                    })
                    .setMinValue(1)
                    .setMaxValue(180)
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("format")
                    .setDescription("Decide the format of the duration")
                    .setDescriptionLocalizations({
                        de: "Wähle das Format aus für die Dauer"
                    })
                    .addChoices(
                        { name: 'minutes', value: 'min'},
                        { name: 'hours', value: 'hour'},
                        { name: 'days', value: 'days'},
                    )
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("reason")
                    .setNameLocalizations({
                        de: "grund"
                    })
                    .setDescription("What was the reason for the timeout")
                    .setDescriptionLocalizations({
                        de: "Gebe den Grund für den Timeout an"
                    })
                    .setRequired(true)
                ),
                // #endregion
                // #region Kick a user
                new SlashCommandBuilder()
                .setName("kick")
                .setDescription("Kick the user from the server")
                .setDescriptionLocalizations({
                    de: "Schmeiße den Benutzer vom Server"
                })
                .addStringOption(option => option
                    .setName("userid")
                    .setNameLocalizations({
                        de: "benutzerid"
                    })
                    .setDescription("User id of the person")
                    .setDescriptionLocalizations({
                        de: "Benutzer ID der Person"
                    })
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("reason")
                    .setNameLocalizations({
                        de: "grund"
                    })
                    .setDescription("Add a reason for the kick")
                    .setDescriptionLocalizations({
                        de: "Gebe den Grund für den Kick an"
                    })
                    .setRequired(true)
                ),
                // #endregion
                // #region Delete a message from a user
                new SlashCommandBuilder()
                .setName("delete")
                .setNameLocalizations({
                    de: "lösche"
                })
                .setDescription("Delete a specific message from a user")
                .setDescriptionLocalizations({
                    de: "Lösche eine bestimmte Nachricht von einem Benutzer"
                })
                .addStringOption(option => option
                    .setName("msgid")
                    .setNameLocalizations({
                        de: "nachrichtid"
                    })
                    .setDescription("Insert the message id here")
                    .setDescriptionLocalizations({
                        de: "Gebe die Nachricht ID hier an"
                    })
                    .setRequired(true)
                ),
                // #endregion
                // #region Ban a user
                new SlashCommandBuilder()
                .setName("ban")
                .setDescription("Ban a person from this server")
                .setDescriptionLocalizations({
                    de: "Verbanne eine Person von diesen Server"
                })
                .addStringOption(option => option
                    .setName("userid")
                    .setNameLocalizations({
                        de: "benutzerid"
                    })
                    .setDescription("Insert their user ID here")
                    .setDescriptionLocalizations({
                        de: "Gebe die Benutzer ID hier an"
                    })
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("reason")
                    .setNameLocalizations({
                        de: "grund"
                    })
                    .setDescription("What is the reason for banning this person?")
                    .setDescriptionLocalizations({
                        de: "Gebe den Grund für den Ban an"
                    })
                    .setRequired(true)
                ),
                // #endregion
                // #region Purge a channel from certain amount of messages
                new SlashCommandBuilder()
                .setName("purge")
                .setNameLocalizations({
                    de: "massenlöschen"
                })
                .setDescription("Delete multiple messages in channel")
                .setDescriptionLocalizations({
                    de: "Lösche mehrere Nachrichten aus einem Kannal"
                })
                .addIntegerOption(option => option
                    .setName("count")
                    .setNameLocalizations({
                        de: "anzahl"
                    })
                    .setDescription("How many messages do you want to delete")
                    .setDescriptionLocalizations({
                        de: "Wie viele Nachrichten sollen gelöscht werden"
                    })
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true)
                ),
                // #endregion
                // #region Purge a channel from certain amount of messages without leaving logs
                new SlashCommandBuilder()
                .setName("purgeclean")
                .setNameLocalizations({
                    de: "massenlöschensauber"
                })
                .setDescription("Delete multiple messages in channel with a log")
                .setDescriptionLocalizations({
                    de: "Lösche mehrere Nachrichten aus einem Kannal ohne Logs zu erstellen"
                })
                .addIntegerOption(option => option
                    .setName("count")
                    .setNameLocalizations({
                        de: "anzahl"
                    })
                    .setDescription("How many messages do you want to delete")
                    .setDescriptionLocalizations({
                        de: "Wie viele Nachrichten sollen gelöscht werden"
                    })
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true)
                ),
                // #endregion
                // #region Reactions
                new SlashCommandBuilder()
                .setName("reactions")
                .setNameLocalizations({
                    de: "reaktionen"
                })
                .setDescription("Block, unblock, remove one or all reactions from a message")
                .setDescriptionLocalizations({
                    de: "Blockiere, entblockiere, entferne eine oder alle reaktionen von einer Nachricht"
                })
                .addStringOption(option => option
                    .setName("msgid")
                    .setNameLocalizations({
                        de: "nachrichtid"
                    })
                    .setDescription("Insert message id here")
                    .setDescriptionLocalizations({
                        de: "Füge die Nachrichten ID hier ein"
                    })
                    .setRequired(true)
                )
                .addIntegerOption(option => option
                    .setName("option")
                    .setDescription("Choose a interaction")
                    .setDescriptionLocalizations({
                        de: "Wähle eine Interaktion aus"
                    })
                    .addChoices(
                        { name: "block", value: 0 },
                        { name: "unblock", value: 1 },
                        { name: "remove emoji", value: 2 },
                        { name: "remove all", value: 3 },
                    )
                    .setRequired(true)
                ),
                // #endregion

                // Owner only area (disable later!)
                // #region Rules buttons
                new SlashCommandBuilder()
                .setName("rulesbutton")
                .setNameLocalizations({
                    de: "regelknopf"
                })
                .setDescription("Add 'Accept' and 'Deny' button")
                .setDescriptionLocalizations({
                    de: "Füge eine 'Annehmen' und 'Ablehnen' Knopf hinzu"
                })
                .addStringOption(option => option
                    .setName("channel")
                    .setNameLocalizations({
                        de: "kannal"
                    })
                    .setDescription("Select in which channel you want to add the buttons")
                    .setDescriptionLocalizations({
                        de: "Wähle den Kannal aus "
                    })
                    .addChoices(
                        { name: "readme", value: "en" },
                        { name: "readme-de", value: "de" },
                    )
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("message")
                    .setNameLocalizations({
                        de: "nachricht"
                    })
                    .setDescription("Add a bot message to the buttons")
                    .setDescriptionLocalizations({
                        de: "Füge eine Bot Nachricht zu den Knöpfen hinzu"
                    })
                    .setRequired(true)
                ),
                // #endregion
                // #region Language buttons
                new SlashCommandBuilder()
                .setName("rulesbutton2")
                .setNameLocalizations({
                    de: "regelknopf2"
                })
                .setDescription("Add 'english' and 'deutsch' button")
                .setDescriptionLocalizations({
                    de: "Füge 'Englisch' und 'Deutsch' Knöpfe hinzu"
                })
                .addStringOption(option => option
                    .setName("channel")
                    .setNameLocalizations({
                        de: "kannal"
                    })
                    .setDescription("Select in which channel you want to add the buttons")
                    .setDescriptionLocalizations({
                        de: "Wähle den Kannal aus wo die Knöpfe hinzugefügt werden sollen"
                    })
                    .addChoices(
                        { name: "readme", value: "en" },
                        { name: "readme-de", value: "de" },
                    )
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("message")
                    .setNameLocalizations({
                        de: "nachricht"
                    })
                    .setDescription("Add a bot message to the buttons")
                    .setDescriptionLocalizations({
                        de: "Füge eine Bot Nachricht zu den Knöpfen hinzu"
                    })
                    .setRequired(true)
                ),
                // #endregion
                // #region Request 'Player' role button
                new SlashCommandBuilder()
                .setName("requestplayerbutton")
                .setNameLocalizations({
                    de: "beantragespielerknopf"
                })
                .setDescription("Add a request 'Player' role button")
                .setDescriptionLocalizations({
                    de: "Füge eine beantrage 'Spiele' Rolle Knopf hinzu"
                })
                .addStringOption(option => option
                    .setName("channel")
                    .setNameLocalizations({
                        de: "kannal"
                    })
                    .setDescription("Select in which channel you want to add the button")
                    .setDescriptionLocalizations({
                        de: "Wähle den Kannal aus wo die Knöpfe hinzugefügt werden sollen"
                    })
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
                .setNameLocalizations({
                    de: "schreibenachricht"
                })
                .setDescription("Post a bot message")
                .setDescriptionLocalizations({
                    de: "Schreibe eine Bot Nachricht"
                })
                .addSubcommand(subcommand => subcommand
                    .setName("normal")
                    .setDescription("Post a normal message")
                    .setDescriptionLocalizations({
                        de: "Poste eine normale Nachricht"
                    })
                    .addStringOption(option => option
                        .setName("channel")
                        .setNameLocalizations({
                            de: "kannal"
                        })
                        .setDescription("Insert the channel id")
                        .setDescriptionLocalizations({
                            de: "Füge die Kannal ein ein"
                        })
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("message")
                        .setNameLocalizations({
                            de: "nachricht"
                        })
                        .setDescription("What should the bot write for you")
                        .setDescriptionLocalizations({
                            de: "Was soll der Bot für dich schreiben"
                        })
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("image")
                        .setNameLocalizations({
                            de: "bild"
                        })
                        .setDescription("Add an image to the message")
                        .setDescriptionLocalizations({
                            de: "Füge ein Bild zu deiner Nachricht hinzu"
                        })
                        .setRequired(false)
                    )
                    .addBooleanOption(option => option
                        .setName("blockreactions")
                        .setNameLocalizations({
                            de: "blockierereaktionen"
                        })
                        .setDescription("Should reactions be allowed for this post?")
                        .setDescriptionLocalizations({
                            de: "Sollen Reaktionen für die Nachricht erlaubt sein?"
                        })
                        .setRequired(false)
                    )
                )
                .addSubcommand(subcommand => subcommand
                    .setName("embed")
                    .setDescription("Post a embed message")
                    .setDescriptionLocalizations({
                        de: "Poste eine embed Nachricht"
                    })
                    .addStringOption(option => option
                        .setName("channel")
                        .setNameLocalizations({
                            de: "kannal"
                        })
                        .setDescription("Insert the channel id")
                        .setDescriptionLocalizations({
                            de: "Füge die Kannal ID ein"
                        })
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("headline")
                        .setNameLocalizations({
                            de: "überschrift"
                        })
                        .setDescription("Give the embed message a headline")
                        .setDescriptionLocalizations({
                            de: "Gebe der Embed Nachricht eine Überschrift"
                        })
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("message")
                        .setNameLocalizations({
                            de: "nachricht"
                        })
                        .setDescription("What should the bot write for you")
                        .setDescriptionLocalizations({
                            de: "Was soll der Bot für dich schreiben"
                        })
                        .setRequired(true)
                    )
                    .addBooleanOption(option => option
                        .setName("calender")
                        .setNameLocalizations({
                            de: "kalender"
                        })
                        .setDescription("Add a calender to the message")
                        .setDescriptionLocalizations({
                            de: "Füge ein Kalender zu deiner Nachricht hinzu"
                        })
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("startdate")
                        .setNameLocalizations({
                            de: "startdatum"
                        })
                        .setDescription("Set a start time for a event (Insert TIMESTAMP)")
                        .setDescriptionLocalizations({
                            de: "Setzte eine Startzeitpunkt für ein Event (Füge TIMESTAMP ein)"
                        })
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("enddate")
                        .setNameLocalizations({
                            de: "enddatum"
                        })
                        .setDescription("Set a end time for a event(Insert TIMESTAMP)")
                        .setDescriptionLocalizations({
                            de: "Setzte ein Endzeitpunkt für ein Event (Füge TIMESTAMP ein)"
                        })
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("image")
                        .setNameLocalizations({
                            de: "bild"
                        })
                        .setDescription("Add an image to the message")
                        .setDescriptionLocalizations({
                            de: "Füge ein Bild zu der Nachricht hinzu"
                        })
                        .setRequired(false)
                    )
                    .addBooleanOption(option => option
                        .setName("blockreactions")
                        .setNameLocalizations({
                            de: "blockierereaktionen"
                        })
                        .setDescription("Should reactions be allowed for this post?")
                        .setDescriptionLocalizations({
                            de: "Sollen Reaktionen für diese Nachricht erlaubt sein?"
                        })
                        .setRequired(false)
                    )
                ),
                // #endregion
                // #region Postrules
                new SlashCommandBuilder()
                .setName("postrules")
                .setNameLocalizations({
                    de: "posteregeln"
                })
                .setDescription("Post a message from rule files")
                .setDescriptionLocalizations({
                    de: "Poste eine Nachricht von dem Regel Dateien"
                })
                .addStringOption(option => option
                    .setName("channel")
                    .setNameLocalizations({
                        de: "kannal"
                    })
                    .setDescription("Insert the channel id")
                    .setDescriptionLocalizations({
                        de: "Füge die Kannal ID ein"
                    })
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("headline")
                    .setNameLocalizations({
                        de: "überschrift"
                    })
                    .setDescription("The Headline for the embed message")
                    .setDescriptionLocalizations({
                        de: "Die Überschrift für die Embed Nachricht"
                    })
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("language")
                    .setNameLocalizations({
                        de: "sprache"
                    })
                    .setDescription("In which language should the rules be?")
                    .setDescriptionLocalizations({
                        de: "In welcher Sprache sollen die Regeln sein?"
                    })
                    .addChoices(
                        { name: "English", value: "rules-en.info" },
                        { name: "German", value: "rules-de.info" }
                    )
                    .setRequired(true)
                ),
                // #endregion
                // #region Botstatus
                new SlashCommandBuilder()
                .setName("botstatus")
                .setDescription("Set the status for a bot")
                .setDescriptionLocalizations({
                    de: "Setze einen Status für einen Bot"
                })
                .addIntegerOption(option => option
                    .setName("bot")
                    .setDescription("Select the bot")
                    .setDescriptionLocalizations({
                        de: "Wähle den Bot aus"
                    })
                    .addChoices(
                        { name: "Scarlet", value: 0 },
                        { name: "Nova", value: 1 }
                    )
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("type")
                    .setDescription("Select the type")
                    .setDescriptionLocalizations({
                        de: "Wähle die Art aus"
                    })
                    .addChoices(
                        { name: "Online", value: "online" },
                        { name: "Idle", value: "idle" },
                        { name: "Busy", value: "dnd" },
                        { name: "Invisible", value: "invisible" }
                    )
                    .setRequired(true)
                ),
                // #endregion
                // #region Bot activity
                new SlashCommandBuilder()
                .setName("botactivity")
                .setNameLocalizations({
                    de: "botaktivität"
                })
                .setDescription("Set the activity for a bot")
                .setDescriptionLocalizations({
                    de: "Setze eine Aktivität für einen Bot"
                })
                .addIntegerOption(option => option
                    .setName("bot")
                    .setDescription("Select the bot")
                    .setDescriptionLocalizations({
                        de: "Wähle einen Bot aus"
                    })
                    .addChoices(
                        { name: "Scarlet", value: 0 },
                        { name: "Nova", value: 1 }
                    )
                    .setRequired(true)
                )
                .addIntegerOption(option => option
                    .setName("type")
                    .setDescription("Set the type")
                    .setDescriptionLocalizations({
                        de: "Wähle die Art aus"
                    })
                    .addChoices(
                        { name: "Playing", value: 0 },
                        { name: "Streaming", value: 1 },
                        { name: "Listening", value: 2 },
                        { name: "Watching", value: 3 },
                        { name: "Custom", value: 4 },
                        { name: "Competing", value: 5 }
                    )
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("text")
                    .setDescription("Insert text here")
                    .setDescriptionLocalizations({
                        de: "Füge einen Text ein"
                    })
                    .setRequired(false)
                ),
                // #endregion
                // #region ReloadSettings
                new SlashCommandBuilder()
                .setName("reloadsettings")
                .setNameLocalizations({
                    de: "einstellungneuladen"
                })
                .setDescription("Reloads all parameter from the settings.json into the bot")
                .setDescriptionLocalizations({
                    de: "Lade alle parameter von settings.json in den Bot neu ein"
                })
                // #endregion
                
            ]
        })
    } catch (error) {
        return error
    }
}

module.exports = { cmds }