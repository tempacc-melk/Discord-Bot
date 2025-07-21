const { EmbedBuilder, AttachmentBuilder } = require('discord.js')

const guildLogo = new AttachmentBuilder('./Assets/GuildLogo.png', { name: 'GuildLogo.png' })
const guildImage = new AttachmentBuilder('./Assets/FooterImage.png', { name: 'FooterImage.png' })

function generateEmbed (stitle, msg, image, options = {}) {
    const innerEmbed = new EmbedBuilder()
        .setColor(0x003366)
        .setThumbnail(`attachment://${guildLogo.name}` )
        .addFields({ name: stitle, value: msg })
        .setTimestamp()

    if (options.pmcal) {
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
    if (image != null) innerEmbed.setImage(`attachment://${image}`)

    return innerEmbed
}

module.exports = {  generateEmbed, guildLogo, guildImage }