import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} from "discord.js"
import { Button } from "../types"

const button: Button = {
    customId: "ticket_help_confirm",
    execute: async (interaction: ButtonInteraction) => {
        const modal = new ModalBuilder()
            .setCustomId("ticket.create.help.modal")
            .setTitle("Помощь — Заявка")

        const topicInput = new TextInputBuilder()
            .setCustomId("topicInput")
            .setLabel("Как вам помочь?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)

        const detailInput = new TextInputBuilder()
            .setCustomId("detailInput")
            .setLabel("Подробности или контекст вашего вопроса")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000)

        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(topicInput)
        const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(detailInput)

        await interaction.showModal(modal.addComponents(row1, row2))
    }
}

export default button