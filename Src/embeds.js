const { EmbedBuilder, AttachmentBuilder } = require('discord.js')

const guildLogo = new AttachmentBuilder('./Assets/GuildLogo.png', { name: 'GuildLogo.png' })
const guildImage = new AttachmentBuilder('./Assets/FooterImage.png', { name: 'FooterImage.png' })
const guildImageDel = new AttachmentBuilder('./Assets/FooterImageDel.png', { name: 'FooterImageDel.png' })

function generateEmbed (stitle, msg, image, options = {}) {
    const innerEmbed = new EmbedBuilder()
        .setColor(0x003366)
        .setTitle(stitle)
        .setThumbnail(`attachment://${guildLogo.name}` )
        .setDescription(msg)
        .setTimestamp()

    if (options != null) {
        if (options.pmmsg) {
            innerEmbed.setThumbnail(null)
            innerEmbed.addFields({ name: " ", value: options.pmmsg })
        }
        if (options.pmcal != null) {
            const curDate = new Date()
            const starttimer = options.pmstart != null ? options.pmstart : parseInt(curDate.getTime()/1000)
            const endtimer = options.pmend != null ? options.pmend : null
            innerEmbed.addFields({ name: ':arrow_forward:Start Date', value: `<t:${starttimer}:F>`, inline: true })
            if (endtimer != null) {
                innerEmbed.addFields({ name: ':stop_button:End Date', value: `<t:${endtimer}:F>`, inline: true })
            } else {
                innerEmbed.addFields({ name: ':stop_button:End Date', value: `No End Date!`, inline: true })
            }
        }
    }
    
    if (image != null) innerEmbed.setImage(`attachment://${image}`)

    return innerEmbed
}

function rulesEmbed (stitle, language) {
    const fs = require('fs')
    const rules = fs.readFileSync(`./Infos/${language}`).toString().split('\n')

    const innerEmbed = new EmbedBuilder()
        .setColor(0x003366)
        .setThumbnail(`attachment://${guildLogo.name}` )
        .addFields(
            { name: `${rules[0]}`, value: `${rules[1]}`,inline: false},
            { name: `${rules[2]}`, value: `${rules[3]}${rules[4]}${rules[5]}`, inline: false },
            { name: `${rules[6]}`, value: `${rules[7]}${rules[8]}`, inline: false },
            { name: `${rules[9]}`, value: `${rules[10]}${rules[11]}`, inline: false },
            { name: `${rules[12]}`, value: `${rules[13]}${rules[14]}`, inline: false },
            { name: `${rules[15]}`, value: `${rules[16]}${rules[17]}${rules[18]}`, inline: false },
            { name: `${rules[19]}`, value: `${rules[20]}${rules[21]}${rules[22]}`, inline: false },
            { name: `${rules[23]}`, value: `${rules[24]}${rules[25]}`, inline: false },

        )
        .setImage(`attachment://${guildImage.name}`)
        .setTimestamp()


    if (stitle != null) innerEmbed.setTitle(`${stitle}`)

    return innerEmbed
}

module.exports = {  generateEmbed, guildLogo, guildImage, guildImageDel, rulesEmbed }