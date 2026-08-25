import { FindGameByControlChannelID } from "../structures/Game"
import { FindCharacterByID } from "../structures/GameCharacters"
import { Modal } from "../types"

const modal : Modal = {
    customId: "control.game.characters.edit",
    execute: async (interaction, uniqueID) => {
        const channelID = interaction.channel.id

        const nameInput = interaction.fields.getTextInputValue("nameInput")
        const titleInput = interaction.fields.getTextInputValue("titleInput")

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const character = FindCharacterByID(uniqueID, game)
        if (!character) return interaction.reply({content: "Упс... что-то пошло не так. (character is undefined)", ephemeral: true})

        {
            var char = game.gamecharacters.find(c => c.uniqueID === uniqueID)
            if (char) {
                char.name = nameInput
                char.title = titleInput
                game.save()
            }
        }

        {
            var char = interaction.client.gamecharacters.find(c => c.uniqueID === uniqueID)
            if (char) {
                char.name = nameInput
                char.title = titleInput
            }
        }

        interaction.reply({content: "Готово!", ephemeral: true})
    }
}

export default modal