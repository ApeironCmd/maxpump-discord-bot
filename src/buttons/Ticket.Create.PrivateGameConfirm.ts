import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} from "discord.js"
import { Button } from "../types"

const button: Button = {
    customId: "ticket_private_game_confirm",
    execute: async (interaction: ButtonInteraction) => {
        const modal = new ModalBuilder()
            .setCustomId("ticket.create.private_game.modal")
            .setTitle("Запрос на приватную игру — Заявка")

        const gameNameInput = new TextInputBuilder()
            .setCustomId("gameNameInput")
            .setLabel("Название планируемой игры")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)

        const steamIdInput = new TextInputBuilder()
            .setCustomId("steamIdInput")
            .setLabel("Ваш Steam ID")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(20)

        const descriptionInput = new TextInputBuilder()
            .setCustomId("descriptionInput")
            .setLabel("Описание приватной игры")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000)

        const dateInput = new TextInputBuilder()
            .setCustomId("dateInput")
            .setLabel("Дата проведения игры")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(50)

        const preferencesInput = new TextInputBuilder()
            .setCustomId("preferencesInput")
            .setLabel("Дополнительные предпочтения")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(1000)

        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(gameNameInput)
        const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(steamIdInput)
        const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
        const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents(dateInput)
        const row5 = new ActionRowBuilder<TextInputBuilder>().addComponents(preferencesInput)

        await interaction.showModal(modal.addComponents(row1, row2, row3, row4, row5))
    }
}

export default button