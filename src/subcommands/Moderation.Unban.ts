import { SubCommand } from "../types"
import { FindSteamID } from "../structures/SteamID"
import { GetData, SetData } from "../structures/Data"

const command : SubCommand = {
    id: "moderation.unban",
    execute: async (interaction) => {
        const userID = interaction.user.id

        const canAcces = GetData("moderation_access", {}, true)[userID]
        if (!canAcces) return interaction.reply({content: "У вас недостаточно прав для выполнения этой операции!", ephemeral: true})

        const user_id : string = String(interaction.options.get("user").value)
        const userSteamID = FindSteamID(user_id)

        const data : Object = GetData("bans", {}, true)
        if (data[user_id] || data[userSteamID]) {
            delete(data[user_id])
            delete(data[userSteamID])

            SetData("bans", data)

            interaction.reply({content: `Готово! Вы успешно разблокировали пользователю <@${user_id}> записи на игры.`, ephemeral: true})
        } else {
            interaction.reply({content: `Пользователя <@${user_id}> нет в списке заблокированных участников!`, ephemeral: true})
        }
    }
}

export default command