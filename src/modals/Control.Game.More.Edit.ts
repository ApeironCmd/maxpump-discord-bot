import { FindGameByControlChannelID } from "../structures/Game"
import { Modal } from "../types"

const modal : Modal = {
    customId: "control.game.more.edit",
    execute: async (interaction, index) => {
        const channelID = interaction.channel.id

        const titleInput = interaction.fields.getTextInputValue("titleInput") || ""
        const descriptionInput = interaction.fields.getTextInputValue("descriptionInput")

        const page = Number(index)
        if (page === undefined) return interaction.reply({content: "Упс... что-то пошло не так. (page is undefined)", ephemeral: true})

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const info = game.more[page]
        if (!info) return interaction.reply({content: "Упс... что-то пошло не так. (info is undefined)", ephemeral: true})

        game.more[page] = {
            title: titleInput,
            description: descriptionInput
        }
        game.save()

        interaction.reply({content: "Готово!", ephemeral: true})
    }
}

export default modal