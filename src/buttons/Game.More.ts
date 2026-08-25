import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js"
import { FindGameByControlChannelID } from "../structures/Game"
import { Button } from "../types"

export async function LoadMore(interaction : ButtonInteraction, page : number, isUpdate? : boolean) {
    const channelID = interaction.channel.id

    let game = interaction.client.games.get(channelID)
    if (!game) {
        game = FindGameByControlChannelID(channelID)
    }
    if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

    const array = game.more

    const info = array[page]
    if (!info) return interaction.reply({content: "Упс... что-то пошло не так. (info is undefined)", ephemeral: true})

    if (isUpdate) {
        await interaction.deferUpdate()
    } else {
        await interaction.deferReply({ephemeral: true})
    }

    const embed = new EmbedBuilder()
        .setColor([47,49,54])
        .setDescription(info.description)
    
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`game.more.page/${page - 1}`)
                .setLabel("Предыдущая страница")
                .setEmoji("⬅️")
                .setDisabled(page <= 0)
                .setStyle(ButtonStyle.Secondary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`game.more.page/${page + 1}`)
                .setLabel("Следующая страница")
                .setEmoji("➡️")
                .setDisabled(page >= array.length - 1)
                .setStyle(ButtonStyle.Secondary)
        )

    let files = []
    let text = info.title
    if (text.search(".png") != -1 || text.search(".jpg") != -1 || text.search(".gif") != -1) {
        text = ""
        files = [info.title]
    }

    interaction.editReply({content: text, embeds: [embed], components: [row], files: files})
}

const button : Button = {
    customId: "game.more",
    execute: async (interaction) => {
        if (interaction.channel == null || (interaction.channel.isThread() && interaction.channel.archived)) return

        const game = interaction.client.games.get(interaction.channelId)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.more.length <= 0) return interaction.reply({content: "Тут ничего нет!", ephemeral: true})

        LoadMore(interaction, 0, false)
    }
}

export default button