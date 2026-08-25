import { SubCommand } from "../types"
import { FindSteamID, SteamIDTo64 } from "../structures/SteamID"
import { GetData } from "../structures/Data"

const command : SubCommand = {
    id: "steamid.find",
    execute: async (interaction) => {
        const steamID : string = String(interaction.options.get("steamid").value)

        let data = GetData("users_steamid", {})

        let find = undefined
        Object.entries(data).forEach(entry => {
            const [userid, steamid] = entry

            if (steamid == steamID) {
                find = userid
            }
        })

        if (find) {
            interaction.reply({content: `Данный SteamID привязан к пользователю <@!${find}>! [Открыть профиль](https://discordredirect.discordsafe.com/users/${find})`, ephemeral: true})
        } else {
            interaction.reply({content: `Данный SteamID не привязан к аккаунту Discord!`, ephemeral: true})
        }
    }
}

export default command