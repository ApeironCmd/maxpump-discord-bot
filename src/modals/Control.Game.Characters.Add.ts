import { FindGameByControlChannelID } from "../structures/Game"
import { GameCharacter } from "../structures/GameCharacters"
import { Modal } from "../types"

const modal : Modal = {
    customId: "control.game.characters.add",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const uniqueIDInput = interaction.fields.getTextInputValue("uniqueIDInput")
        const nameInput = interaction.fields.getTextInputValue("nameInput")
        const titleInput = interaction.fields.getTextInputValue("titleInput")

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.gamecharacters.length >= 25) return interaction.reply({content: "Упс... что-то пошло не так. (gamecharacters limited [25])", ephemeral: true})

        for (const character of game.gamecharacters) {
            if (character.uniqueID == uniqueIDInput) {
                return interaction.reply({content: `У вас уже есть персонаж с UniqueID ${uniqueIDInput}!`, ephemeral: true})
            }
        }

        game.gamecharacters.push(
            new GameCharacter()
                .setName(nameInput)
                .setTitle(titleInput)
                .setUniqueID(uniqueIDInput)
                .setCategory("oc")
        )
        game.save()

        interaction.reply({content: "Вы успешно добавили персонажа нового персонажа", ephemeral: true})
    }
}

export default modal