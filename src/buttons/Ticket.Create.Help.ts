import {
    ButtonInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js"
import { Button } from "../types"

const button: Button = {
    customId: "ticket_help",
    execute: async (interaction: ButtonInteraction) => {
        const embed = new EmbedBuilder()
            .setTitle("🆘 Помощь — Информация по подаче")
            .setColor("Blue")
            .setDescription(
                `• Ваш вопрос не должен содержать в себе юмористический контекст.\n` +
                `• Ваш вопрос должен напрямую относиться к проекту.\n` +
                `• В случае вопроса технического характера - приложите необходимые сведения.\n\n` +

                `⚠️ Несоблюдение условий может привести к недопонимаю, из-за чего будет невозможно дать ответ.`
            )

        const confirmButton = new ButtonBuilder()
            .setCustomId("ticket_help_confirm")
            .setLabel("✅ Запросить помощь")
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton)

        await interaction.reply({
            ephemeral: true,
            embeds: [embed],
            components: [row]
        })
    }
}

export default button