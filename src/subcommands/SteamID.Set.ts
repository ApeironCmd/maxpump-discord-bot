import { ButtonInteraction, ModalSubmitInteraction } from "discord.js"
import { SubCommand } from "../types"
import { EditSteamID, SteamIDTo64 } from "../structures/SteamID"

const command : SubCommand = {
    id: "steamid.set",
    execute: async (interaction) => {
        const userID = interaction.user.id

        EditSteamID(interaction, userID, async (interaction : ButtonInteraction | ModalSubmitInteraction, userSteamID : string) => {
            interaction.reply({content: `Вы успешно привязали SteamID! [${userSteamID}](https://steamcommunity.com/profiles/${SteamIDTo64(userSteamID)})`, ephemeral: true})
        })
    }
}

export default command