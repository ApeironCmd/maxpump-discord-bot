import { SelectMenu } from "../types"
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { FindGameByControlChannelID } from "../structures/Game"

const selectMenu : SelectMenu = {
    customId: "control.game.more.edit",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const page = Number(interaction.values[0])
        if (page === undefined) return interaction.reply({content: "Упс... что-то пошло не так. (page is undefined)", ephemeral: true})

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const array = game.more

        const info = array[page]
        if (!info) return interaction.reply({content: "Упс... что-то пошло не так. (info is undefined)", ephemeral: true})
        
        const modal = new ModalBuilder()
            .setCustomId(`control.game.more.edit/${page}`)
            .setTitle("Изменить страницу")

        const titleInput = new TextInputBuilder()
            .setCustomId("titleInput")
            .setRequired(false)
            .setLabel("Заголовок")
            .setValue(info.title)
            .setPlaceholder("Ссылка на картинку или видео")
            .setStyle(TextInputStyle.Short)

        const descriptionInput = new TextInputBuilder()
            .setCustomId("descriptionInput")
            .setRequired(true)
            .setMinLength(5)
            .setLabel("Описание")
            .setValue(info.description)
            .setPlaceholder("Ваше описание")
            .setStyle(TextInputStyle.Paragraph)

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
        )

        await interaction.showModal(modal)
    }
}

export default selectMenu