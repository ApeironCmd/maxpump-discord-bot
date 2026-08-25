import {
    ButtonInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js"
import { Button } from "../types"

const button: Button = {
    customId: "ticket_complaint",
    execute: async (interaction: ButtonInteraction) => {
        const embed = new EmbedBuilder()
            .setTitle("📋 Жалоба — Информация по подаче")
            .setColor("Red")
            .setDescription(
                `• Жалоба не должна содержать в себе юмористический подтекст.\n` +
                `• Жалоба должна напрямую относиться к проекту.\n\n` +

                `Выберите тип жалобы:\n` +
                `🌐 **Жалоба в сообществе** — нарушитель вне игрового сервера.\n` +
                `🎮 **Жалоба на сервере** — инцидент в рамках игрового процесса.\n\n` +

                `⚠️ Несоблюдение условий снижает шанс на одобрение или может привести к ужесточению наказания.`
            )

        const communityButton = new ButtonBuilder()
            .setCustomId("ticket_complaint_community")
            .setLabel("🌐 В сообществе")
            .setStyle(ButtonStyle.Danger)

        const serverButton = new ButtonBuilder()
            .setCustomId("ticket_complaint_server")
            .setLabel("🎮 На сервере")
            .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(communityButton, serverButton)

        await interaction.reply({
            ephemeral: true,
            embeds: [embed],
            components: [row]
        })
    }
}

export default button