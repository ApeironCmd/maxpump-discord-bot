import { SelectMenu } from "../types"
import { EmbedBuilder, Message, TextChannel } from "discord.js"
import { AppManagementMessageByID, FindControlChannelByID, FindGameByControlChannelID, GameComponent, UserComponent } from "../structures/Game"
import { buildElements, dmMessage } from "../buttons/Game.SignUp.Success"
import { FindCharacterByID } from "../structures/GameCharacters"
import { GetStatusByID } from "../structures/GameStatus"
import { SteamIDTo64 } from "../structures/SteamID"

const statusList = {
    underconsideration: 1,
    accept: 2,
    reserve: 3,
    reject: 4
}

const selectMenu : SelectMenu = {
    customId: "control.app.managestatus",
    execute: async (interaction, user_id) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        const user = game.users.get(user_id)

        if (!user) return interaction.reply({content: "Упс... что-то пошло не так. (user is undefined)", ephemeral: true})
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const selectStatus = interaction.values[0]
        if (!selectStatus) return interaction.reply({content: "Упс... что-то пошло не так. (selectStatus is undefined)", ephemeral: true})

        const statusID = statusList[selectStatus]
        if (statusID == user.status) return interaction.reply({content: "У данного пользователя уже установлен данный статус игры!", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        const controlChannel = interaction.channel as TextChannel

        const appManagementMessage = await AppManagementMessageByID(controlChannel, user.messageID).catch((error) => {})
        if (!appManagementMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (appManagementMessage is undefined)"})

        if (selectStatus === "accept" || selectStatus === "reserve") {
            const character = FindCharacterByID(user.character, game)
            if (!character) return interaction.editReply({content: "Упс... что-то пошло не так. (У данного игрока отсутствует основной персонаж)"})
        } else {
            user.character = undefined
        }

        user.status = statusID
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