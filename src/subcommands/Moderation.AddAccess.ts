import { SubCommand } from "../types"
import { GetData, SetData } from "../structures/Data"

const command : SubCommand = {
    id: "moderation.add_access",
    execute: async (interaction) => {
        const userID = interaction.user.id

        const canAcces = GetData("full_access", {}, true)[userID]
        if (!canAcces) return interaction.reply({content: "У вас недостаточно прав для выполнения этой операции!", ephemeral: true})

        const user_id : string = String(interaction.options.get("user").value)

        const data : Object = GetData("moderation_access", {}, true)
        if (data[user_id]) return interaction.reply({content: `Пользователь <@${user_id}> уже имеет доступ к модерированию игр!`, ephemeral: true})

        data[user_id] = true
        SetData("moderation_access", data)

        interaction.reply({content: `Вы успешно выдали пользователю <@${user_id}> доступ к командам модерирования игр!`, ephemeral: true})
    }
}

export default command