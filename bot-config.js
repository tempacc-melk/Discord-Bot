const Sequelize = require('sequelize')
const fs = require('fs')
// #region Onstart
function initializeLaunch() {
    console.log("===================================")
    // Create Assets folder for all images
    if (!fs.existsSync('./Assets')) { 
        console.log("Missing 'Assets' folder")
        fs.mkdirSync('./Assets') 
        console.log("Created 'Assets' folder")
    }
    // Create Infos folder for all files
    if (!fs.existsSync('./Infos')) {
        console.log("Missing 'Infos' folder")
	    fs.mkdirSync('./Infos')
        console.log("Created 'Infos' folder")
    }
    // Create settings.json in infos folder
    if (!fs.existsSync('./Infos/settings.json')) {
        const settingsFile = {
            "botToken": "...", 
            "botID": "...", 
            "serverID": "...", 
            "ownerID": "...", 
            "serverLanguages": {
                "en": "english",
                "de": "deutsch"
            },
            "channelEN": "...", 
            "channelDE": "...", 
            "rulesAccepted": "...", 
            "rulesDenied": "...", 
            "adminRole": "...", 
            "moderator-role-id": "...",
            "dev-role-id": "...",
            "memberRole": "...",
            "englishRole": "...",
            "germanRole": "...",
            "globalLogging": false,
            "channelLog": "...",
            "editLogging": false,
            "channelMsgEdit": "...",
            "delLogging": false,
            "channelMsgDel": "...",
            "timeoutLogging": false,
            "channelUserTimeout": "...",
            "banLogging": false,
            "channelUserBan": "..." ,
            "enable-url-filterlist": false,
            "allowAutoReloadSettings": false
        }
        try {
            const settingsObj = JSON.stringify(settingsFile, null, 2)
            fs.writeFileSync('./Infos/settings.json', settingsObj, 'utf-8')
            return 1
        } catch {
            return 0
        }
    }
}
function normalizeWords(message) {
    return message.toLowerCase().replace(/[.,\-;:_'"§$%&/?()=]/g, ""); 
}
// #endregion
// #region Detect owner input
function detectOwnerInput(message) {
    const splitMsg = message.toLowerCase().split(' ').map(normalizeWords).filter(Boolean)
    splitMsg.splice(0, 1)

    let output = "If you see this message something went wrong."

    const { reload } = require('./index.js')
    let jsonData = fs.readFileSync ('./Infos/settings.json', 'utf-8')
    jsonData = JSON.parse(jsonData)

    console.log (`Owner has typed ${splitMsg.length} words (divided by ' ') -> Analyzing the text...`)
    const helpMe = ["help"]
    if (helpMe.every(items => splitMsg.includes(items))) {
        output = `If you wish to see all commands type: "list all commands", if you wish to know something else, you have to wait for my improvements.\nI'm still lacking multiple additional functions.`
    }

    // List all available known commands
    const listAllFunction = ["list", "all", "commands"]
    if (listAllFunction.every(items => splitMsg.includes(items))) {
        output = "Here is a list of all normal chat commands:\n"
        output += "1. Reload Settings\n"
        output += "2. Change global logging VALUE\n"
        output += "3. Change edit logging VALUE\n"
        //output += "\n4. ..."
        output += "==========================================\n"
        output += "Here is a list of all slash commands:\n"
        output += "1. /rules [language] [number] [point]\n"
        output += "2. /slow-mode [channel] [duration]\n"
        output += "3. /timeout [user-id] [duration] [format] [reason]\n"
        output += "4. /kick [user-id] [reason]\n"
        output += "5. /delete [msg-id]\n"
        output += "6. /ban [user-id] [reason]\n"
        output += "7. /purge [count]\n"
        output += "8. /purgeclean [count]\n"
        output += "9. /reloadsettings"
    }
    // Reload all settings
    const refreshSettings = ["reload", "settings"]
    if (refreshSettings.every(items => splitMsg.includes(items))) {
        if (jsonData.allowAutoReloadSettings) {
            output = "Auto reload settings is enabled, there is no need for manuall reloading."
        } else {
            reload()
            output = "I loaded all variables from the settings files."
        }
    }
    // Change the global logging parameter
    const changeGlobalLogging = ["change", "global", "logging"]
    if (changeGlobalLogging.every(items => splitMsg.includes(items))) {
        const newData = ["true", "1"].some(items => splitMsg.includes(items)) ? true : false
        adjustSettings(jsonData, { globalLogging: newData })

        output = `I changed the global logging bool to: ${newData}`
    }
    // Change the edit logging parameter
    const changeEditLogging = ["change", "edit", "logging"]
    if (changeEditLogging.every(items => splitMsg.includes(items))) {
        const newData = ["true", "1"].some(items => splitMsg.includes(items)) ? true : false
        adjustSettings(jsonData, { editLogging: newData })

        output = `I changed the edit logging bool to: ${newData}`
    }

    if (jsonData.allowAutoReloadSettings) reload()
    return output
}
// #endregion
// #region Change Settings Parameter
function adjustSettings (jsonData, options = {}) {
    if (options !== null) {
        // Language

        // Logging
        if (options.globalLogging != null) jsonData.globalLogging = options.globalLogging        
        if (options.editLogging != null) jsonData.editLogging = options.editLogging
        if (options.delLogging != null) jsonData.delLogging = options.delLogging
        if (options.timeoutLogging != null) jsonData.timeoutLogging = options.timeoutLogging
        if (options.banLogging != null) jsonData.banLogging = options.banLogging
        
        // Url filterlist
        if (options.enableUrlfilterlist != null) jsonData.enableUrlfilterlist = options.enableUrlfilterlist
        
    }
    fs.writeFileSync('./Infos/settings.json', JSON.stringify(jsonData, null, 2), 'utf-8')
}
// #endregion

// #region Allowlist Area
let enableUrlAllowlist = false
global.enableUrlAllowlist = enableUrlAllowlist
const urlallowlist = []

function changeUrlAllowlist (value, options = {}) {
    const innerBool = Boolean(value)
    let output = innerBool ? "UrlAllowlist enabled" : "UrlAllowlist disabled"
    enableUrlAllowlist = innerBool

    if (options.linktype != null && options.linkval != null) {
        if (options.linktype === 0) {
            output += " | " + removeItemFromUrlAllowlist(options.linkval)
        } else {
            output += " | " + addItemToUrlAllowlist(options.linkval)
        }
    }
    
    return output
}

function addItemToUrlAllowlist (newlink) {
    let output = ""
    const inArray = urlallowlist.includes(newlink)
    if (inArray) {
        return "Item is already in the allowlist"
    }
    try {
        urlallowlist.push(newlink)
        output = "Item added to the allowlist"
    } catch (error) {
        output = "Item cannot be added to the allowlist"
    }
    return output
}

function removeItemFromUrlAllowlist (getlink) {
    let output = ""
    const inArray = urlallowlist.includes(getlink)
    if (inArray) {
        try {
            urlallowlist.pop(getlink)
        } catch (error) {
            output = "Item cannot be removed from the allowlist"
        }
        output = "Item removed from the allowlist"
    } else {
        return "Item not found in the allowlist"
    }
    return output
}
// #endregion
// #region Database
async function CheckTheDatabase() {
	let getdate = new Date()
	getdate.setHours(getdate.getHours() + 2)
	getdate = getdate.toISOString().slice(0,19).replace('T',' ')

    const sequelize = await new Sequelize({
        dialect: 'sqlite',
        logging: false,
        storage: './Infos/discord_db.sqlite'
    })
    const dbUsers = sequelize.define('Users', {
        UserID: {
            type: Sequelize.CHAR(30),
            primaryKey: true
        },
        Username: {
            type: Sequelize.STRING,
            allowNull: false
        },
        RulesAccepted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        Lv: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        Exp: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        Joined: {
            type: Sequelize.CHAR(19),
            allowNull: false
        },
        Left: Sequelize.CHAR(19),
    }, {
        timestamps: false,
    })
    await dbUsers.sync()

    // Add the owner to the user list as the first user
    let jsonData = fs.readFileSync ('./Infos/settings.json', 'utf-8')
    jsonData = JSON.parse(jsonData)
    if (await dbUsers.count() <= 0) {
        const newUser = await dbUsers.build({
            UserID: jsonData.ownerID,
            Username: "Owner",
            Joined: getdate
        })
        await newUser.save()
    }

    const dbInteractions = sequelize.define('Interactions', {
        InteractionID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: Sequelize.CHAR(30),
        },
        MsgID: {
            type: Sequelize.CHAR(30),
            allowNull: false
        },
        Interaction: {
            type: Sequelize.CHAR(70),
            allowNull: false
        },
        Target: Sequelize.CHAR(30),
        InteractionDate: {
            type: Sequelize.CHAR(19),
            allowNull: false
        },
        Reason: Sequelize.CHAR
    }, {
        timestamps: false
    })
    await dbInteractions.sync()
    
    console.log(`DB Loaded: ${getdate}`)

    return { 
        dbUsers, 
        dbInteractions 
    }
}
// #endregion

module.exports = { initializeLaunch, CheckTheDatabase, detectOwnerInput, urlallowlist }