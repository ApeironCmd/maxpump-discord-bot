import { Button } from "../types"
import { EditSteamID } from "../structures/SteamID"

const button : Button = {
    customId: "user.steamid.set",
    execute: async (interaction) => {
        const userID = interaction.user.id
        
        EditSteamID(interaction, userID, async (interaction, steamID) => {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: `Ваш SteamID успешно изменен на: ${steamID}` })
            } else {
                await interaction.reply({ content: `Ваш SteamID успешно изменен на: ${steamID}`, ephemeral: true })
            }
        })
    }
}

export default button