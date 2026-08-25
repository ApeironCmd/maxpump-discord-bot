import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { Button } from "../types"
import { FindGameByControlChannelID } from "../structures/Game"

const button : Button = {
    customId: "control.game.editinfo",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})
        
        const modal = new ModalBuilder()
            .setCustomId("control.game.editinfo")
            .setTitle("Изменить игру")

        const synopsisInput = new TextInputBuilder()
            .setRequired(false)
            .setCustomId("synopsisInput")
            .setLabel("Ссылка синопсиса")
            .setPlaceholder("Введите новую ссылку или оставьте поле пустым")
            .setStyle(TextInputStyle.Short)

        const specificationsInput = new TextInputBuilder()
            .setRequired(false)
            .setCustomId("specificationsInput")
            .setLabel("Ссылка характеристики")
            .setPlaceholder("Введите новую ссылку или оставьте поле пустым")
            .setStyle(TextInputStyle.Short)
        
        const additionalInput = new TextInputBuilder()
            .setRequired(false)
            .setCustomId("additionalInput")
            .setLabel("Ссылка доп. информации")
            .setPlaceholder("Введите новую ссылку или оставьте поле пустым")
            .setStyle(TextInputStyle.Short)

        const charactersInput = new TextInputBuilder()
            .setRequired(false)
            .setCustomId("charactersInput")
            .setValue(game.characters)
            .setLabel("Запрещенные персонажи и категории")
            .setPlaceholder("Воины надежды, K1-B0")
            .setStyle(TextInputStyle.Paragraph)

        const serverInput = new TextInputBuilder()
            .setCustomId("serverInput")
            .setValue(game.server)
            .setLabel("Название сервера")
            .setPlaceholder("Aether")
            .setStyle(TextInputStyle.Short)

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(synopsisInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(specificationsInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(additionalInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(charactersInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(serverInput)
        )

        await interaction.showModal(modal)
    }
}

export default button