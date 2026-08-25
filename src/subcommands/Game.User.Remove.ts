import { Message, TextChannel } from "discord.js"
import { SubCommand } from "../types"
import { FindGameByControlChannelID, AppManagementMessageByID } from "../structures/Game"
import { GetData } from "../structures/Data"
import { RemoveInteractionArgs } from "../structures/InteractionsArguments"

const command : SubCommand = {
    id: "game.user_remove",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const user_id : string = String(interaction.options.get("user_id").value)

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Данную команду можно использовать только в канале с управлением!", ephemeral: true})

        const user = game.users.get(user_id)
        if (!user) return interaction.reply({content: "Пользователь не был найден!", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        const controlChannel = interaction.channel as TextChannel

        const appManagementMessage = await AppManagementMessageByID(controlChannel, user.messageID).catch((error) => {}) as Message
        if (!appManagementMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (appManagementMessage is undefined)"})

        async function removeAllMessages() {
            const userID = user.id

            const data = GetData("interactionsargs", {})
            if (typeof(data) === "object") {
                Object.keys(data).forEach(async (key) => {
                    const element = data[key]

                    if (element.gameID == game.game_id && element.userID == userID) {
                        RemoveInteractionArgs(key)

                        const interactionMessage = await controlChannel.messages.fetch(key).catch((error) => {})
                        if (interactionMessage) {
                            await interactionMessage.delete().catch((error) => {})
                        }
                    }
                })
            }

            if (user.needHelp_id) {
                const needHelpMessage = await controlChannel.messages.fetch(user.needHelp_id).catch((error) => {})
                if (needHelpMessage) {
                    await needHelpMessage.delete().catch((error) => {})
                }
            }

            await appManagementMessage.delete().catch((error) => {})
        }

        await removeAllMessages()

        game.users.delete(user.id)
        game.save()

        await interaction.editReply({content: "Готово!"})
    }
}

export default command