import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { Button } from "../types"
import { FindGameByControlChannelID } from "../structures/Game"

const button : Button = {
    customId: "control.game.more.add",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.more.length >= 5) return interaction.reply({content: "Упс... что-то пошло не так. (more limited [5])", ephemeral: true})

        const modal = new ModalBuilder()
            .setCustomId("control.game.more.add")
            .setTitle("Добавить новую страницу")

        const titleInput = new TextInputBuilder()
            .setCustomId("titleInput")
            .setRequired(false)
            .setLabel("Заголовок")
            .setPlaceholder("Ссылка на картинку или видео")
            .setStyle(TextInputStyle.Short)

        const descriptionInput = new TextInputBuilder()
            .setCustomId("descriptionInput")
            .setRequired(true)
            .setMinLength(5)
            .setLabel("Описание")
            .setPlaceholder("Ваше описание")
            .setStyle(TextInputStyle.Paragraph)

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
        )

        await interaction.showModal(modal)
    }
}

export default button