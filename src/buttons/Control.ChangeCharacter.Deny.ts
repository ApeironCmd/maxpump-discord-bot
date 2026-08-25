import { EmbedBuilder } from "discord.js"
import { Button } from "../types"
import { RemoveInteractionArgs } from "../structures/InteractionsArguments"
import { FindCharacterByID } from "../structures/GameCharacters"
import { SteamIDTo64 } from "../structures/SteamID"
import { FindGameByControlChannelID } from "../structures/Game"
import { UserCacheHelper } from "../structures/UserCacheHelper"

const button : Button = {
    customId: "control.changecharacter.deny",
    execute: async (interaction, userID) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const user = game.users.get(userID)
        if (!user) return interaction.reply({content: "Упс... что-то пошло не так. (user is undefined)", ephemeral: true})

        const character = FindCharacterByID(user.character, game)
        if (!character) return interaction.reply({content: "Упс... что-то пошло не так. (character is undefined)", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        RemoveInteractionArgs(interaction.message.id)
        await interaction.message.delete()

        await interaction.editReply({content: "Заявка на смену персонажа была **отказана**!"})

        const member = await UserCacheHelper.getUser(interaction.client, user.id)
        if (!member) return

        const emoji = character.emoji ? `<:${character.emoji}>` : ""

        const embedDM = new EmbedBuilder()
            .setColor([47,49,54])
            .setTitle(`Смена персонажа на игре «${game.title}»`)
            .setDescription(`Ваша заявка на смену персонажа была **Отказана**!`)
            .setFooter({text: interaction.user.tag, iconURL: interaction.user.avatarURL()})
            .addFields(
                {name: " ", value: `• [\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id})\n${emoji} ${character.name}`, inline: true},
                {name: " ", value: `• DiscordID — [${user.id}](https://discordredirect.discordsafe.com/users/${user.id})\n• SteamID — [${user.steam_id}](https://steamcommunity.com/profiles/${SteamIDTo64(user.steam_id)})`, inline: true}
            )
        
        await member.send({embeds: [embedDM]}).catch((error) => {})
    }
}

export default button