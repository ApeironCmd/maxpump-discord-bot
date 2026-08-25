import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import { Button } from "../types"

const button : Button = {
    customId: "navigation.startplaying",
    execute: async (interaction) => {
        const isFromEphemeral = interaction.message && interaction.message.reference
        
        if (isFromEphemeral) {
            await interaction.deferUpdate()
        } else {
            await interaction.deferReply({ ephemeral: true })
        }

        const content = `# Сессионные и приватные игры Asterion Academy

Выберите тип игры:`

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Оф. сессионные игры")
                    .setURL("https://discord.com/channels/744899300277878796/1089043019887554671")
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel("Приватные игры")
                    .setURL("https://discord.com/channels/744899300277878796/1116322186672734270")
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setCustomId("ticket_private_game")
                    .setLabel("Организовать приватную игру")
                    .setStyle(ButtonStyle.Success)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Правила игрового сервера")
                    .setURL("http://srv.asterion.games/internalrules")
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setCustomId("navigation.main")
                    .setLabel("Вернуться назад")
                    .setStyle(ButtonStyle.Secondary)
            )

        await interaction.editReply({ content, components: [row, row2] })
    }
}

export default button