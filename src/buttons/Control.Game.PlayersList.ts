import { Button } from "../types"
import { FindGameByControlChannelID } from "../structures/Game"
import { LoadPage } from "./Game.PlayersList"

const button : Button = {
    customId: "control.game.playerslist",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        LoadPage(interaction, 0, true, false)
    }
}

export default button