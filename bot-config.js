const Sequelize = require('sequelize');
const fs = require('fs');
const readline = require('readline');
// #region Onstart
function initializeLaunch() {
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
        try {
            const settingsObj = JSON.stringify(settingsFile, null, 2)
            fs.writeFileSync('./Infos/settings.json', settingsObj, 'utf-8')
            return 1
        } catch (error) {
            return 0
        }
    }
    // Check if the database exists
    if (!fs.existsSync('./Infos/discord_db.sqlite')) {
        console.log ("Database has not been found, creating one...")
        const rl = readline.createInterface(
            process.stdin,
            process.stdout
        )
        /*
        rl.question('New username: ', (input) => {
            // do stuff here...
            rl.close()
        })
        rl.question('New password: ', (input) => {
            // do stuff here....
            rl.close()
        })
        */
    }
}
// #endregion
// #region Detect owner input
function detectOwnerInput (message) {
    let output = "I detected your input, nothing happened yet. [wip]"
    const splitMsg = message.split(' ')

    output = `You have typed ${splitMsg.length} words -> Analyzing the text...`
    // ...
    return output
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
async function CheckTheDatabase () {
    // Create discord_db.sqlite in infos folder
    const [getUser, getPass] = await DatabaseLogin()
    if (getUser === null || getPass === null) {
        return console.log ("Invalid login token")
    }
    const sequelize = await new Sequelize('discord_db.sqlite', getUser, getPass, {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: './Infos/discord_db.sqlite',
    })

    try {
        sequelize.authenticate()
        console.log("Authentication - ok")
    } catch (error) {
        return console.log(`Authentication error: ${error}`)
    }

    const dbAccounts = sequelize.define('Accounts', {
        userid: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        username: Sequelize.STRING,
    })
    dbAccounts.sync()
    
    const dbWarnings = sequelize.define('Warnings', {
        id: {
             type: Sequelize.INTEGER,
             primaryKey: true
        },
        userid: {
            type: Sequelize.STRING,
            references: {
                model: 'Accounts',
                key: 'userid'
            }
        },
        msgID: {
            type: Sequelize.STRING,
            unique: true
        },
        status: Sequelize.STRING,
        action: Sequelize.INTEGER,
        reason: Sequelize.STRING
    })

    dbAccounts.hasMany(dbWarnings, { foreignKey: 'userid' })
    dbWarnings.belongsTo(dbAccounts)

    dbWarnings.sync()
    
}
// #endregion
// #region Database stuff
async function DatabaseLogin () {
    // do stuff here...
    return [ 'user', 'password' ]
}
// #endregion

module.exports = { initializeLaunch, CheckTheDatabase, detectOwnerInput, urlallowlist }