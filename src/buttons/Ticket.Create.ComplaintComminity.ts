import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} from "discord.js"
import { Button } from "../types"

const button: Button = {
    customId: "ticket_complaint_community",
    execute: async (interaction: ButtonInteraction) => {
        const modal = new ModalBuilder()
            .setCustomId("ticket.create.complaint.community")
            .setTitle("Жалоба в сообществе")

        const input1 = new TextInputBuilder()
            .setCustomId("nickInput")
            .setLabel("Ник виновного")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const input2 = new TextInputBuilder()
            .setCustomId("dateInput")
            .setLabel("Дата произошедшего")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const input3 = new TextInputBuilder()
            .setCustomId("detailInput")
            .setLabel("Подробности")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Опишите ситуацию. Доказательства прикрепите позже в канале.")
            .setRequired(true)
            .setMaxLength(1000)

        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(input1)
        const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(input2)
        const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(input3)

        modal.addComponents(row1, row2, row3)

        await interaction.showModal(modal)
    }
}

export default button