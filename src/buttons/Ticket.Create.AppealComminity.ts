import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} from "discord.js"
import { Button } from "../types"

const button: Button = {
    customId: "ticket_appeal_community",
    execute: async (interaction: ButtonInteraction) => {
        const modal = new ModalBuilder()
            .setCustomId("ticket.create.appeal.community")
            .setTitle("Апелляция в сообществе")

        const input1 = new TextInputBuilder()
            .setCustomId("adminNick")
            .setLabel("Ник наказавшего")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const input2 = new TextInputBuilder()
            .setCustomId("dateInput")
            .setLabel("Дата произошедшего")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const input3 = new TextInputBuilder()
            .setCustomId("reasonInput")
            .setLabel("Причины пересмотра")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000)

        const input4 = new TextInputBuilder()
            .setCustomId("detailInput")
            .setLabel("Подробности")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Опишите всё подробно. Доказательства прикрепите позже в канале.")
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