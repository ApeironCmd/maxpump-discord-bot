import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} from "discord.js"
import { Button } from "../types"

const button: Button = {
    customId: "ticket_complaint_server",
    execute: async (interaction: ButtonInteraction) => {
        const modal = new ModalBuilder()
            .setCustomId("ticket.create.complaint.server")
            .setTitle("Жалоба на сервере")

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
            .setCustomId("steamInput")
            .setLabel("Steam ID нарушителя")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const input4 = new TextInputBuilder()
            .setCustomId("detailInput")
            .setLabel("Подробности")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Укажите все важные детали. Доказательства отправьте в канал после создания тикета.")
            .setRequired(true)
            .setMaxLength(1000)

        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(input1)
        const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(input2)
        const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(input3)
        const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents(input4)

        await interaction.showModal(modal.addComponents(row1, row2, row3, row4))
    }
}

export default button