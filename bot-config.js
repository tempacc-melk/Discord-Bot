const fs = require('fs')
// #region Firststart
function initializeLaunch() {
    if (!fs.existsSync('./Assets')) { 
        console.log("Missing 'Assets' folder")
        fs.mkdirSync('./Assets') 
        console.log("Created 'Assets' folder")
    }

    if (!fs.existsSync('./Infos')) {
        console.log("Missing 'Infos' folder")
	    fs.mkdirSync('./Infos')
        console.log("Created 'Infos' folder")
    }

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
}
// #endregion
// #region Detect owner input
function detectOwnerInput (message) {
    let output = "I detected your input, nothing happened yet. [wip]"
    const splitMsg = message.split(' ')

    output = `You have typed ${splitMsg.length} words -> Analysing the text...`
    // ...
    return output
}
// #endregion
// #region Whitelist Area
let allowWhitelist = false
global.allowWhitelist = allowWhitelist
const whitelist = []

function changeWhitelistStatus (value, options = {}) {
    const innerBool = Boolean(value)
    let output = ""
    allowWhitelist = innerBool

    if (innerBool) {
        output = "Whistelist enabled"
    } else {
        output = "Whitelist disabled"
    }

    if (options.linktype != null && options.linkval != null) {
        if (options.linktype === 0) {
            output += " | " + removeItemFromWhitelist(options.linkval)
        } else {
            output += " | " + addItemToWhitelist(options.linkval)
        }
    }
    
    return output
}

function addItemToWhitelist (newlink) {
    let output = ""
    const inArray = whitelist.includes(newlink)
    if (inArray) {
        return "Item is already in the whitelist"
    }
    try {
        whitelist.push(newlink)
        output = "Item added to the whitelist"
    } catch (error) {
        output = "Item cannot be added to the whitelist"
    }
    return output
}

function removeItemFromWhitelist (getlink) {
    let output = ""
    const inArray = whitelist.includes(getlink)
    if (inArray) {
        try {
            whitelist.pop(getlink)
        } catch (error) {
            output = "Item cannot be removed from the whitelist"
        }
        output = "Item removed from the whitelist"
    } else {
        return "Item not found in the whitelist"
    }
    return output
}
// #endregion

module.exports = { initializeLaunch, detectOwnerInput, whitelist }