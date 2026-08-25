import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { Button } from "../types"
import { FindGameByControlChannelID } from "../structures/Game"

const button : Button = {
    customId: "control.game.characters.add",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.gamecharacters.length >= 25) return interaction.reply({content: "Упс... что-то пошло не так. (gamecharacters limited [25])", ephemeral: true})

        const modal = new ModalBuilder()
            .setCustomId("control.game.characters.add")
            .setTitle("Добавить нового персонажа")

        const uniqueIDInput = new TextInputBuilder()
            .setCustomId("uniqueIDInput")
            .setLabel("Уникальный ID персонажа")
            .setMinLength(3)
            .setMaxLength(30)
            .setPlaceholder("my_best_character")
            .setStyle(TextInputStyle.Short)
        
        const nameInput = new TextInputBuilder()
            .setCustomId("nameInput")
            .setLabel("Имя персонажа")
            .setMinLength(2)
            .setMaxLength(30)
            .setPlaceholder("Лучший персонаж")
            .setStyle(TextInputStyle.Short)

        const titleInput = new TextInputBuilder()
            .setCustomId("titleInput")
            .setLabel("Описание персонажа")
            .setMinLength(2)
            .setMaxLength(30)
            .setPlaceholder("Абсолютный уникальный персонаж")
            .setStyle(TextInputStyle.Short)

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(uniqueIDInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput)
        )

        await interaction.showModal(modal)
    }
}

export default button