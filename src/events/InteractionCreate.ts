import { Client, Events } from "discord.js"
import hook = require("../structures/Hook")
import { parse_custom_id } from "../structures/ParseCustomID"

module.exports = (client: Client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isChatInputCommand()) {
            const commandName = interaction.commandName
            const [id, ...args] = parse_custom_id(commandName)

            const userID = interaction.user.id

            const command = client.commands.get(id)
            if (!command) return

            let cooldown = client.cooldowns.get(`${id}-${userID}`) || 0
            if (command.cooldown) {
                if (Date.now() < cooldown) {
                    const time = Math.floor(Math.abs(Date.now() - cooldown) / 1000)
                    interaction.reply({content: `Подождите еще ${time} секунд прежде чем использовать эту команду еще раз!`, ephemeral: true})
                    return
                }

                client.cooldowns.set(`${id}-${userID}`, Date.now() + command.cooldown * 1000)
                setTimeout(() => {
                    client.cooldowns.delete(`${id}-${userID}`)
                }, command.cooldown * 1000)
            }

            if (command.roles && command.roles[interaction.guildId]) {
                const member = await interaction.guild.members.fetch(userID)
                let allow = true

                const memberRoles = member["_roles"]
                const guildRoles = command.roles[interaction.guildId]

                guildRoles.forEach(role => {
                    const found = memberRoles.find(element => element == role)
                    if (!found) allow = false
                })

                if (!allow) {
                    interaction.reply({content: `У вас недостаточно прав на выполнение данной команды!`, ephemeral: true})
                    return
                }
            }

            hook.Run("ChatInputCommand", interaction)
            command.execute(interaction, ...args)
        }else if (interaction.isModalSubmit()) {
            const modalID = interaction.customId
            const [id, ...args] = parse_custom_id(modalID)

            const modal = client.modals.get(id)
            if (!modal) return

            hook.Run("ModalSubmit", interaction)
            modal.execute(interaction, ...args)
        }else if (interaction.isButton()) {
            const buttonID = interaction.customId
            const [id, ...args] = parse_custom_id(buttonID)

            const button = client.buttons.get(id)
            if (!button) return

            hook.Run("Button", interaction)
            button.execute(interaction, ...args)
        }else if (interaction.isStringSelectMenu()) {
            const selectMenuID = interaction.customId
            const [id, ...args] = parse_custom_id(selectMenuID)

            const selectMenu = client.select_menus.get(id)
            if (!selectMenu) return

            hook.Run("SelectMenu", interaction)
            selectMenu.execute(interaction, ...args)
        }
    })
}