import { SelectMenu } from "../types"
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { FindGameByControlChannelID } from "../structures/Game"
import { FindCharacterByID } from "../structures/GameCharacters"

const selectMenu : SelectMenu = {
    customId: "control.game.characters.edit",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const uniqueID = interaction.values[0]

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const character = FindCharacterByID(uniqueID, game)
        if (!character) return interaction.reply({content: "Упс... что-то пошло не так. (character is undefined)", ephemeral: true})

        const modal = new ModalBuilder()
            .setCustomId(`control.game.characters.edit/${uniqueID}`)
            .setTitle("Изменить персонажа")
        
        const nameInput = new TextInputBuilder()
            .setCustomId("nameInput")
            .setLabel("Имя персонажа")
            .setMinLength(2)
            .setMaxLength(30)
            .setPlaceholder("Лучший персонаж")
            .setValue(character.name)
            .setStyle(TextInputStyle.Short)

        const titleInput = new TextInputBuilder()
            .setCustomId("titleInput")
            .setLabel("Описание персонажа")
            .setMinLength(2)
            .setMaxLength(30)
            .setPlaceholder("Абсолютный уникальный персонаж")
            .setValue(character.title)
            .setStyle(TextInputStyle.Short)

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput)
        )

        await interaction.showModal(modal)
    }
}

export default selectMenu