const Sequelize = require('sequelize');
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

    output = `You have typed ${splitMsg.length} words -> Analyzing the text...`
    // ...
    return output
}
// #endregion
// #region Allowlist Area
let allowAllowlist = false
global.allowAllowlist = allowAllowlist
const allowlist = []

function changeAllowlistStatus (value, options = {}) {
    const innerBool = Boolean(value)
    let output = ""
    allowAllowlist = innerBool

    if (innerBool) {
        output = "Allowlist enabled"
    } else {
        output = "Allowlist disabled"
    }

    if (options.linktype != null && options.linkval != null) {
        if (options.linktype === 0) {
            output += " | " + removeItemFromAllowlist(options.linkval)
        } else {
            output += " | " + addItemToAllowlist(options.linkval)
        }
    }
    
    return output
}

function addItemToAllowlist (newlink) {
    let output = ""
    const inArray = allowlist.includes(newlink)
    if (inArray) {
        return "Item is already in the allowlist"
    }
    try {
        allowlist.push(newlink)
        output = "Item added to the allowlist"
    } catch (error) {
        output = "Item cannot be added to the allowlist"
    }
    return output
}

function removeItemFromAllowlist (getlink) {
    let output = ""
    const inArray = allowlist.includes(getlink)
    if (inArray) {
        try {
            allowlist.pop(getlink)
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

module.exports = { initializeLaunch, detectOwnerInput, allowlist }