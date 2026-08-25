import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import { Button } from "../types"

const button : Button = {
    customId: "navigation.main",
    execute: async (interaction) => {
        const isFromEphemeral = interaction.message && interaction.message.reference
        
        if (isFromEphemeral) {
            await interaction.deferUpdate()
        } else {
            await interaction.deferReply({ ephemeral: true })
        }

        const content = `# Навигация MAX-PUMP

Выберите нужный раздел:`

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("navigation.startplaying")
                    .setLabel("Начать играть")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("ticket_help")
                    .setLabel("Служба поддержки")
                    .setStyle(ButtonStyle.Secondary)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ваши предложения")
                    .setURL("https://discord.com/channels/744899300277878796/1116322514524721223")
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel("Баг репорты")
                    .setURL("https://discord.com/channels/744899300277878796/1116322562306211850")
                    .setStyle(ButtonStyle.Link),
                // new ButtonBuilder()
                //     .setLabel("Документация")
                //     .setURL("http://srv.max-pump.games/rules")
                //     .setStyle(ButtonStyle.Link)
            )

        await interaction.editReply({ content, components: [row, row2] })
    }
}

export default button