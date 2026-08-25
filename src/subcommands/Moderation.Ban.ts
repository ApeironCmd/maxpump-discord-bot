import { SubCommand } from "../types"
import { EmbedBuilder } from "discord.js"
import axios from "axios"
import { FindSteamID } from "../structures/SteamID"
import { GetData, SetData } from "../structures/Data"

const millisecondsPerDay = 24 * 60 * 60 * 1000

const command : SubCommand = {
    id: "moderation.ban",
    execute: async (interaction) => {
        const userID = interaction.user.id

        const canAcces = GetData("moderation_access", {}, true)[userID]
        if (!canAcces) return interaction.reply({content: "У вас недостаточно прав для выполнения этой операции!", ephemeral: true})

        const user_id : string = String(interaction.options.get("user").value)
        const days_add : number = Number(interaction.options.get("days").value)

        const userSteamID = FindSteamID(user_id)

        const time = Date.now()
        const newTime = time + (days_add * millisecondsPerDay)

        const data : Object = GetData("bans", {}, true)
        data[user_id] = newTime
        if (userSteamID) data[userSteamID] = newTime
        SetData("bans", data)

        interaction.reply({content: `Готово! Вы запретили пользователю <@${user_id}> записываться на игры на ${days_add} дней.`, ephemeral: true})
    }
}

export default command