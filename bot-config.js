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
            "roleGerman": "...",
            "globalLogging": false,
            "loggingFormat": "channel",
            "channelLog": "...",
            "editLogging": false,
            "channelMsgEdit": "...",
            "delLogging": false,
            "channelMsgDel": "...",
            "timeoutLogging": false,
            "channelUserTimeout": "...",
            "banLogging": false,
            "channelUserBan": "..." ,
            "enable-url-filterlist": false
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

    console.log (`Owner has typed ${splitMsg.length} words (divided by ' ') -> Analyzing the text...`)
    // List all available known commands
    const listAllFunction = ["list", "all", "commands"]
    if (listAllFunction.every(items => splitMsg.includes(items))) {
        output = "1. Reload Settings \n2. Change global logging VALUE\n3. ..."
    }
    //splitMsg.forEach(console.log)

    const refreshSettings = ["reload", "settings"]
    if (refreshSettings.every(items => splitMsg.includes(items))) {
        const { reload } = require('./index.js')
        reload()
        output = "I reloaded the settings file."
    }
    
    const changeGlobalLogging = ["change", "global", "logging"]
    if (changeGlobalLogging.every(items => splitMsg.includes(items))) {
        let jsonData = fs.readFileSync('./Infos/settings.json', 'utf-8')
        jsonData = JSON.parse(jsonData)
        const newData = ["true", "1"].some(items => splitMsg.includes(items)) ? true : false
        
        jsonData.globalLogging = newData

        fs.writeFileSync('./Infos/settings.json', JSON.stringify(jsonData, null, 2), 'utf8')
        output = `I changed the global logging bool to: ${newData}`
    }

    return output
}
// #endregion
// #region Change Settings Parameter
// Fully untested area
function adjustSettings (options = {}) {
    const jsonData = fs.readFileSync ('./Infos/settings.json')
    if (options != null) {
        // Language

        // Logging
        if (options.globalLogging !== null) {
            jsonData.push({ "globalLogging": Boolean(options.globalLogging) })
        }
        if (options.loggingFormat !== null) {
            jsonData.push({ "loggingFormat": options.loggingFormat === "database" ? "database" : "channel" })
        }
        if (options.editLogging !== null) {
            jsonData.push({ "editLogging": Boolean(options.editLogging) })
        }
        if (options.delLogging !== null) {
            jsonData.push({ "delLogging": Boolean(options.delLogging) })
        }
        if (options.timeoutLogging !== null) {
            jsonData.push({ "timeoutLogging": Boolean(options.timeoutLogging) })
        }
        if (options.banLogging !== null) {
            jsonData.push({ "banLogging": Boolean(options.banLogging) })
        }

        // Url filterlist
        if (options.enableUrlfilterlist !== null) {
            jsonData.push({ "enable-url-filterlist": Boolean(options.enableUrlfilterlist) })
        }
    }
    fs.writeFileSync(jsonData, null, 'utf-8')
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
    const sequelize = await new Sequelize({
        dialect: 'sqlite',
        logging: false,
        storage: './Infos/discord_db.sqlite',
    })

    const dbUsers = sequelize.define('Users', {
        UserID: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        Username: Sequelize.STRING,
        RulesAccepted: Sequelize.BOOLEAN,
        Lv: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        Exp: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        Joined: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        Left: Sequelize.DATE,
    }, {
        timestamps: false
    })
    await dbUsers.sync()
    
    const dbInteractions = sequelize.define('Interactions', {
        InteractionID: {
             type: Sequelize.BIGINT,
             primaryKey: true
        },
        UserID: {
            type: Sequelize.STRING,
            references: {
                model: 'Users',
                key: 'UserID'
            }
        },
        MsgID: {
            type: Sequelize.STRING,
            unique: true
        },
        Interaction: Sequelize.STRING,
        InteractionDate: Sequelize.NOW,
        Reason: Sequelize.STRING
    }, {
        timestamps: false
    })
    await dbInteractions.sync()
    
    const getDBdate = new Date()
    console.log(`DB Loaded: ${getDBdate.toLocaleDateString()} ${getDBdate.toLocaleTimeString()}`)

    return { dbUsers, dbInteractions }
}
// #endregion

module.exports = { initializeLaunch, CheckTheDatabase, detectOwnerInput, urlallowlist }