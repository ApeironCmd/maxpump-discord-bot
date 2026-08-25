import { SubCommand } from "../types"
import { FindSteamID, SteamIDTo64 } from "../structures/SteamID"

const command : SubCommand = {
    id: "steamid.my",
    execute: async (interaction) => {
        const userID = interaction.user.id

        const userSteamID = FindSteamID(userID)
        if (userSteamID) {
            interaction.reply({content: `SteamID привязанный к вашему аккаунту: [${userSteamID}](https://steamcommunity.com/profiles/${SteamIDTo64(userSteamID)})`, ephemeral: true})
        } else {
            interaction.reply({content: `Вы еще не привязаывали SteamID к вашему аккаунту! Используйте команду </steamid set:1080293757800427522> для привязки`, ephemeral: true})
        }
    }
}

export default command