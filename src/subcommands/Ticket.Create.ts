import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} from "discord.js"
import { SubCommand } from "../types"

const command: SubCommand = {
    id: "ticket.create",
    execute: async (interaction) => {
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ticket_complaint")
                    .setLabel("Жалоба")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("ticket_help")
                    .setLabel("Помощь/Вопрос")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("ticket_private_game")
                    .setLabel("Приватная Игра")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("ticket_appeal")
                    .setLabel("Апелляция")
                    .setStyle(ButtonStyle.Secondary),

            )

        await interaction.reply({
            content: "Выберите тип запроса:",
            components: [row],
            ephemeral: true
        })
    }
}

export default command