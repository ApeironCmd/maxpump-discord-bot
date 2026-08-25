import { SubCommand } from "../types"
import { GetData, SetData } from "../structures/Data"

const command : SubCommand = {
    id: "moderation.remove_ban",
    execute: async (interaction) => {
        const userID = interaction.user.id

        const canAcces = GetData("moderation_access", {}, true)[userID]
        if (!canAcces) return interaction.reply({content: "У вас недостаточно прав для выполнения этой операции!", ephemeral: true})

        const unique_id : string = String(interaction.options.get("unique_id").value)

        const data : Object = GetData("bans", {}, true)
        if (data[unique_id]) {
            delete(data[unique_id])

            SetData("bans", data)

            interaction.reply({content: `Готово! Вы успешно разблокировали пользователю с идентификатором "${unique_id}" записи на игры.`, ephemeral: true})
        } else {
            interaction.reply({content: `Пользователя с идентификатором "${unique_id}" нет в списке заблокированных участников!`, ephemeral: true})
        }
    }
}

export default command