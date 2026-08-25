import { ButtonInteraction, ChatInputCommandInteraction, Client, ModalSubmitInteraction, PartialMessage, StringSelectMenuInteraction } from "discord.js"
import hook = require("./structures/Hook")

module.exports = (client: Client) => {
    hook.Add("ChatInputCommand", "Logs", (interaction : ChatInputCommandInteraction) => {
        console.log(`Пользователь ${interaction.user.username} использовал команду ${interaction.commandName}`)
    })

    hook.Add("ModalSubmit", "Logs", (interaction : ModalSubmitInteraction) => {
        console.log(`Пользователь ${interaction.user.username} отправил запрос из модельного окна ${interaction.customId}`)
    })

    hook.Add("Button", "Logs", (interaction : ButtonInteraction) => {
        console.log(`Пользователь ${interaction.user.username} нажал на кнопку ${interaction.customId}`)
    })

    hook.Add("SelectMenu", "Logs", (interaction : StringSelectMenuInteraction) => {
        console.log(`Пользователь ${interaction.user.username} отправил запрос из меню выбора ${interaction.customId}`)
    })

    hook.Add("MessageDelete", "Logs", (message: PartialMessage) => {
        console.log(`Было удалено сообщение с ID ${message.id}`)
    })
}