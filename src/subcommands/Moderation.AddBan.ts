import { SubCommand } from "../types"
import { GetData, SetData } from "../structures/Data"

const millisecondsPerDay = 24 * 60 * 60 * 1000

const command : SubCommand = {
    id: "moderation.add_ban",
    execute: async (interaction) => {
        const userID = interaction.user.id

        const canAcces = GetData("moderation_access", {}, true)[userID]
        if (!canAcces) return interaction.reply({content: "У вас недостаточно прав для выполнения этой операции!", ephemeral: true})

        const unique_id : string = String(interaction.options.get("unique_id").value)
        const days_add : number = Number(interaction.options.get("days").value)

        const time = Date.now()
        const newTime = time + (days_add * millisecondsPerDay)

        const data : Object = GetData("bans", {}, true)
        data[unique_id] = newTime
        SetData("bans", data)

        interaction.reply({content: `Готово! Вы запретили с идентификатором "${unique_id}" записываться на игры на ${days_add} дней.`, ephemeral: true})
    }
}

export default command