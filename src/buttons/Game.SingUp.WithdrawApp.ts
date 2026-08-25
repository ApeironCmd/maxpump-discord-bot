import { TextChannel, EmbedBuilder, Message } from "discord.js"
import { GetData } from "../structures/Data"
import { Button } from "../types"
import { FindCharacterByID } from "../structures/GameCharacters"
import { AppManagementMessageByID, FindControlChannelByID, GetTime } from "../structures/Game"
import { RemoveInteractionArgs } from "../structures/InteractionsArguments"
import { SteamIDTo64 } from "../structures/SteamID"

const button : Button = {
    customId: "game.signup.withdrawapp",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = interaction.client.games.get(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const user = game.users.get(userID)
        if (!user) return interaction.reply({content: "Упс... что-то пошло не так. (user is undefined)", ephemeral: true})

        await interaction.deferUpdate()

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {}) as TextChannel
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        const appManagementMessage = await AppManagementMessageByID(controlChannel, user.messageID).catch((error) => {}) as Message
        if (!appManagementMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (appManagementMessage is undefined)"})

        async function removeAllMessages() {
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

        if (user.status >= 1 && user.status <= 3) {
            await removeAllMessages()

            if (user.status !== 1) {
                const character = FindCharacterByID(user.character, game)
                if (!character) return interaction.editReply({content: "Упс... что-то пошло не так. (character is undefined)"})

                const emoji = character.emoji ? `<:${character.emoji}>` : ""

                const embed = new EmbedBuilder()
                    .setColor([47,49,54])
                    .setTitle(`Отпись от игры «${game.title}»`)
                    .setDescription(`Пользователь [\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id}) отписался от предстоящей игры!`)
                    .setFooter({text: `Уведомление создано ${GetTime()}`, iconURL: interaction.user.avatarURL()})
                    .addFields(
                        {name: " ", value: `• [\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id})\n${emoji} ${character.name}`, inline: true},
                        {name: " ", value: `• DiscordID — [${user.id}](https://discordredirect.discordsafe.com/users/${user.id})\n• SteamID — [${user.steam_id}](https://steamcommunity.com/profiles/${SteamIDTo64(user.steam_id)})`, inline: true}
                    )

                    await controlChannel.send({content: `<@!${game.gamemaster.id}>`,embeds: [embed]})
            }

            game.users.delete(userID)
            game.save()

            await interaction.editReply({content: "Вы успешно отписались от данной игры!", embeds: [], components: [], files: []})
        } else {
            await interaction.editReply({content: "Упс... что-то пошло не так. (user.status === 0)", embeds: [], components: [], files: []})
        }
    }
}

export default button