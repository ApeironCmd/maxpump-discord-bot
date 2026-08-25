import { SelectMenu } from "../types"
import { EmbedBuilder, Message, TextChannel } from "discord.js"
import { AppManagementMessageByID, FindControlChannelByID, GameComponent, UserComponent } from "../structures/Game"
import { buildElements, dmMessage } from "../buttons/Game.SignUp.Success"
import { FindCharacterByID } from "../structures/GameCharacters"
import { GetStatusByID } from "../structures/GameStatus"
import { SteamIDTo64 } from "../structures/SteamID"

const selectMenu : SelectMenu = {
    customId: "control.app.managemaincharacter",
    execute: async (interaction) => {
        let game : GameComponent = undefined
        let user : UserComponent = undefined
        interaction.client.games.forEach(_game => {
            _game.users.forEach(_user => {
                if (_user.messageID == interaction.message.id) {
                    game = _game
                    user = _user
                }
            })
        })

        if (!user) return interaction.reply({content: "Упс... что-то пошло не так. (user is undefined)", ephemeral: true})
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        const controlChannel = interaction.channel as TextChannel

        const appManagementMessage = await AppManagementMessageByID(controlChannel, user.messageID).catch((error) => {})
        if (!appManagementMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (appManagementMessage is undefined)"})

        if (interaction.values.length <= 0) {
            if (user.status === 2 || user.status === 3) {
                const data = buildElements(user, game)
                const embed = data[0]
                const row1 = data[1]
                const row2 = data[2]

                await appManagementMessage.edit({embeds: [embed], components: [row1, row2]})
                return interaction.editReply({content: "Упс... что-то пошло не так. (Нельзя удалить основного персонажа, т.к. заявка уже одобрена)"})
            } else {
                user.character = undefined
            }
        } else {
            const charID = interaction.values[0]

            const character = FindCharacterByID(charID, game)
            if (!character) return interaction.editReply({content: "Упс... что-то пошло не так. (character is undefined)"})

            user.character = charID
        }
        game.save()

        const data = buildElements(user, game)
        const embed = data[0]
        const row1 = data[1]
        const row2 = data[2]

        await appManagementMessage.edit({embeds: [embed], components: [row1, row2]})
        await interaction.editReply({content: "Изменено!"})

        dmMessage(interaction, user, game)
    }
}

export default selectMenu