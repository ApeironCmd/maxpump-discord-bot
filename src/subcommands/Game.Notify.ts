import { SubCommand } from "../types"
import { FindGameByControlChannelID } from "../structures/Game"
import { GetStatusByID } from "../structures/GameStatus"
import { EmbedBuilder } from "discord.js"
import { CreateCharacterText } from "../structures/GameCharacters"
import { UserCacheHelper } from "../structures/UserCacheHelper"

function format(str : string, arr : any[]): string {
    return str.replace(/{(\d+)}/g, function (match, number) {
        return typeof arr[number] != 'undefined' ? arr[number] : match;
    })
}

const command : SubCommand = {
    id: "game.notify",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Данную команду можно использовать только в канале с управлением!", ephemeral: true})

        let array : string[] = []
        game.users.forEach(user => {
            if ((user.status === 2 || user.status === 3) && user.character) {
                array.push(user.id)
            }

            if (user.status === 1 || user.status === 4) {
                array.push(user.id)
            }
        })

        await interaction.deferReply({ephemeral: true})

        for (const userID of array) {
            const user = game.users.get(userID)

            const member = await UserCacheHelper.getUser(interaction.client, userID)
            if (member) {
                const status = GetStatusByID(user.status)
                const notifyMessage = format(status.notifyMessage, [CreateCharacterText(user, game, true)])
                if (notifyMessage) {
                    const embed = new EmbedBuilder()
                        .setColor([47,49,54])
                        .setTitle(`Заявка на игру «${game.title}»`)
                        .setDescription(notifyMessage)

                    await member.send({embeds: [embed]}).catch((error) => {})
                }
            }
        }

        interaction.editReply({content: "Готово!"})
    }
}

export default command