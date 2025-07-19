const { EmbedBuilder, AttachmentBuilder } = require('discord.js')

const modLogo = new AttachmentBuilder('./Assets/ModLogo.png', {
    name: 'ModLogo.png'
})

const guildLogo = new AttachmentBuilder('./Assets/GuildLogo.png', { 
    name: 'GuildLogo.png'
})

function generateEmbed (stitle, sauthor, msg) {
    const innerEmbed = new EmbedBuilder()
        .setColor(0x003366)
        .setAuthor(
            { name: sauthor, iconURL: `attachment://${modLogo.name}` })
        .setThumbnail(`attachment://${guildLogo.name}` )
        .addFields({ name: stitle, value: msg })
        .setTimestamp()

    return innerEmbed
}

module.exports = { generateEmbed, guildLogo, modLogo }