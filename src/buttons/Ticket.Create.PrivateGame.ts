import {
    ButtonInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js"
import { Button } from "../types"

const button: Button = {
    customId: "ticket_private_game",
    execute: async (interaction: ButtonInteraction) => {
        const embed = new EmbedBuilder()
            .setTitle("🎮 Запрос на приватную игру — Информация по подаче")
            .setColor("Green")
            .setDescription(
                `• Запрос на приватную игру не должен содержать в себе юмористический подтекст.\n` +
                `• Запрос на приватную игру должен напрямую относиться к проекту.\n\n` +

                `**Уточнение о деталях запроса:**\n` +
                `Проведение приватных игр является бесплатной услугой. Внешнюю составляющую вашей игры вы оформляете самостоятельно, но можете заказать оформление у дизайнера проекта. В этом случае дизайнер может запросить с вас символическую плату.\n\n` +

                `⚠️ Несоблюдение условий снижает шанс на одобрение.`
            )

        const confirmButton = new ButtonBuilder()
            .setCustomId("ticket_private_game_confirm")
            .setLabel("✅ Подать запрос на игру")
            .setStyle(ButtonStyle.Success)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton)

        await interaction.reply({
            ephemeral: true,
            embeds: [embed],
            components: [row]
        })
    }
}

export default button