import { SubCommand } from "../types"
import { SteamIDTo64 } from "../structures/SteamID"
import { GetData, SetData } from "../structures/Data"

const command : SubCommand = {
    id: "moderation.ban_list",
    execute: async (interaction) => {
        const userID = interaction.user.id

        const canAcces = GetData("moderation_access", {}, true)[userID]
        if (!canAcces) return interaction.reply({content: "У вас недостаточно прав для выполнения этой операции!", ephemeral: true})

        const time = Date.now()
        let data : Object = GetData("bans", {}, true)

        let message = ""
        for (const [user_id, bannedTime] of Object.entries(data)) {
            if (time > bannedTime) {
                delete data[user_id]
                continue
            }

            if (user_id.search("STEAM_") >= 0) {
                message += `[\`${user_id}\`](<https://steamcommunity.com/profiles/${SteamIDTo64(user_id)}>)`
            } else {
                message += `[\`${user_id}\`](<https://discordredirect.discordsafe.com/users/${user_id}>) / (<@${user_id}>)`
            }

            message += ` на ${Math.floor((bannedTime - Date.now()) / 1000 / 60 / 60)} часов\n`
        }

        SetData("bans", data)

        interaction.reply({content: `**Список заблокированных пользователей:**\n${message}`, ephemeral: true})
    }
}

export default command