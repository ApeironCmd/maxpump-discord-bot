import { TextChannel } from "discord.js"
import { SubCommand } from "../types"
import { FindGameByControlChannelID, AppManagementMessageByID } from "../structures/Game"
import { FindCharacterByID } from "../structures/GameCharacters"
import { buildElements, dmMessage } from "../buttons/Game.SignUp.Success"

const command : SubCommand = {
    id: "game.user_addcharacter",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const user_id : string = String(interaction.options.get("user_id").value)
        const character_id : string = String(interaction.options.get("character_id").value)

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Данную команду можно использовать только в канале с управлением!", ephemeral: true})

        const user = game.users.get(user_id)
        if (!user) return interaction.reply({content: "Пользователь не был найден!", ephemeral: true})

        if (user.character) return interaction.reply({content: "У данного игрока выбран основной персонаж!", ephemeral: true})

        const character = FindCharacterByID(character_id, game)
        if (!character) return interaction.reply({content: "Персонаж не был найден!", ephemeral: true})

        let find = user.characters.find(c => c == character_id)
        if (find) return interaction.reply({content: "У игрока уже выбран данный персонаж!", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        const controlChannel = interaction.channel as TextChannel

        const appManagementMessage = await AppManagementMessageByID(controlChannel, user.messageID).catch((error) => {})
        if (!appManagementMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (appManagementMessage is undefined)"})

        user.characters.push(character_id)
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

export default command