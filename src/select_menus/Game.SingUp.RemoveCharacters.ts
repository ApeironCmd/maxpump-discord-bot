import { SelectMenu } from "../types"
import { PermissionFlagsBits } from "discord.js"
import { AppManagementMessageByID, FindControlChannelByID, FindGameByControlChannelID } from "../structures/Game"
import { Vars } from "../structures/Data"
import { arrayRemove } from "./Control.Game.Characters.Remove"
import { buildElements, dmMessage } from "../buttons/Game.SignUp.Success"

const selectMenu : SelectMenu = {
    customId: "game.signup.removecharacters",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = interaction.client.games.get(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const user = game.users.get(userID)
        if (!user) return interaction.reply({content: "Упс... что-то пошло не так. (user is undefined)", ephemeral: true}).catch((error) => {})

        if (user.character) return interaction.reply({content: "Упс... что-то пошло не так. (У вас уже выбран основной персонаж)", ephemeral: true}).catch((error) => {})

        if (user.characters.length <= 1) return interaction.reply({content: "Упс... что-то пошло не так. (У вас достигнуто минимальное количество персонажей)", ephemeral: true}).catch((error) => {})

        await interaction.deferUpdate()

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {})
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        const appManagementMessage = await AppManagementMessageByID(controlChannel, user.messageID).catch((error) => {})
        if (!appManagementMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (appManagementMessage is undefined)"})

        let characters = user.characters
        for (const charID of interaction.values) {
            characters = arrayRemove(characters, charID)
        }
        user.characters = characters
        game.save()

        const data = buildElements(user, game)
        const embed = data[0]
        const row1 = data[1]
        const row2 = data[2]

        await appManagementMessage.edit({embeds: [embed], components: [row1, row2]})
        await interaction.editReply({content: "Вы успешно удалили выбранных персонажей!", embeds: [], components: [], files: []})

        dmMessage(interaction, user, game)
    }
}

export default selectMenu