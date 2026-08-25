import {
    ButtonInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js"
import { Button } from "../types"

const button: Button = {
    customId: "ticket_appeal",
    execute: async (interaction: ButtonInteraction) => {
        const embed = new EmbedBuilder()
            .setTitle("📋 Апелляция — Информация по подаче")
            .setColor("Blue")
            .setDescription(
                `• Апелляция не должна содержать в себе юмористический подтекст.\n` +
                `• Апелляция должна напрямую относиться к проекту.\n\n` +

                `Выберите тип апелляции:\n` +
                `🌐 **Апелляция в сообществе** — наказание было выдано вне игрового сервера.\n` +
                `🎮 **Апелляция на сервере** — наказание выдано в рамках игрового процесса.\n\n` +

                `⚠️ Несоблюдение условий снижает шанс на одобрение.`
            )

        const communityButton = new ButtonBuilder()
            .setCustomId("ticket_appeal_community")
            .setLabel("🌐 В сообществе")
            .setStyle(ButtonStyle.Secondary)

        const serverButton = new ButtonBuilder()
            .setCustomId("ticket_appeal_server")
            .setLabel("🎮 На сервере")
            .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(communityButton, serverButton)

        await interaction.reply({
            ephemeral: true,
            embeds: [embed],
            components: [row]
        })
    }
}

export default button