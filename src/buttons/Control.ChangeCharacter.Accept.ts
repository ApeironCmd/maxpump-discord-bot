import { EmbedBuilder, TextChannel } from "discord.js"
import { Button } from "../types"
import { RemoveInteractionArgs } from "../structures/InteractionsArguments"
import { FindCharacterByID } from "../structures/GameCharacters"
import { buildElements } from "./Game.SignUp.Success"
import { SteamIDTo64 } from "../structures/SteamID"
import { AppManagementMessageByID, FindGameByControlChannelID } from "../structures/Game"
import { UserCacheHelper } from "../structures/UserCacheHelper"

const button : Button = {
    customId: "control.changecharacter.accept",
    execute: async (interaction, userID, selectCharacter) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const character = FindCharacterByID(selectCharacter, game)
        if (!character) return interaction.reply({content: "Упс... что-то пошло не так. (character is undefined)", ephemeral: true})

        const user = game.users.get(userID)
        if (!user) return interaction.reply({content: "Упс... что-то пошло не так. (user is undefined)", ephemeral: true})

        const controlChannel = interaction.channel as TextChannel

        const appManagementMessage = await AppManagementMessageByID(controlChannel, user.messageID).catch((error) => {})
        if (!appManagementMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (appManagementMessage is undefined)"})

        await interaction.deferReply({ephemeral: true})

        user.character = selectCharacter
        game.save()

        const el = buildElements(user, game)
        const embed = el[0]
        const row1 = el[1]
        const row2 = el[2]

        RemoveInteractionArgs(interaction.message.id)

        await interaction.message.delete()
        await appManagementMessage.edit({embeds: [embed], components: [row1, row2]})

        await interaction.editReply({content: "Заявка на смену персонажа была **принята**!"})

        const member = await UserCacheHelper.getUser(interaction.client, user.id)
        if (!member) return

        const emoji = character.emoji ? `<:${character.emoji}>` : ""

        const embedDM = new EmbedBuilder()
            .setColor([47,49,54])
            .setTitle(`Смена персонажа на игре «${game.title}»`)
            .setDescription(`Ваша заявка на смену персонажа была **Одобрена**!`)
            .setFooter({text: interaction.user.tag, iconURL: interaction.user.avatarURL()})
            .addFields(
                {name: " ", value: `• [\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id})\n${emoji} ${character.name}`, inline: true},
                {name: " ", value: `• DiscordID — [${user.id}](https://discordredirect.discordsafe.com/users/${user.id})\n• SteamID — [${user.steam_id}](https://steamcommunity.com/profiles/${SteamIDTo64(user.steam_id)})`, inline: true}
            )
        
        await member.send({embeds: [embedDM]}).catch((error) => {})
    }
}

export default button