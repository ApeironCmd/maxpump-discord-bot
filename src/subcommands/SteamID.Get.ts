import { SubCommand } from "../types"
import { FindSteamID, SteamIDTo64 } from "../structures/SteamID"

const command : SubCommand = {
    id: "steamid.get",
    execute: async (interaction) => {
        const userID : string = String(interaction.options.get("user").value)

        const userSteamID = FindSteamID(userID)
        if (userSteamID) {
            interaction.reply({content: `SteamID привязанный к данному аккаунту: [${userSteamID}](https://steamcommunity.com/profiles/${SteamIDTo64(userSteamID)})`, ephemeral: true})
        } else {
            interaction.reply({content: `Данный пользователь еще не привязывал SteamID к своему аккаунту!`, ephemeral: true})
        }
    }
}

export default command