import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { SelectMenu } from "../types"
import { UserProfile, InvitedUser } from "../structures/UserProfile"
import { GameDataManager } from "../structures/GameDataManager"
import { FindCharacterByID } from "../structures/GameCharacters"
import { SteamIDTo64 } from "../structures/SteamID"
import { UserCacheHelper } from "../structures/UserCacheHelper"

const selectMenu : SelectMenu = {
    customId: "navigation.profile.invited.select",
    execute: async (interaction, playerID) => {
        await interaction.deferUpdate()
        
        const invitedUserID = interaction.values[0]
        const targetUserID = playerID as string || interaction.user.id
        
        const profile = UserProfile.getFullProfile(targetUserID)
        const invitedUsers = profile.invitedUsers as InvitedUser[]
        const invitedUser = invitedUsers.find(user => user.id === invitedUserID)

        if (!invitedUser) {
            await interaction.editReply({ content: "Информация о приглашенном пользователе не найдена." })
            return
        }

        const invitedUserProfile = UserProfile.getFullProfile(invitedUserID)
        // const gamemasterGamesCount = invitedUserProfile.gamemasterGames.length

        const inviteDate = new Date(invitedUser.timestamp).toLocaleDateString('ru-RU')
        const inviteTime = new Date(invitedUser.timestamp).toLocaleTimeString('ru-RU')

        // const userGames = UserProfile.getGameHistory(invitedUserID)
        // const userUpcomingGames = UserProfile.getUpcomingGames(invitedUserID)

        // const sortedUpcomingGames = [...invitedUserProfile.upcomingGames].sort((a, b) => GameDataManager.parseGameId(b.game_id) - GameDataManager.parseGameId(a.game_id))
        // const sortedGameHistory = [...invitedUserProfile.gameHistory].sort((a, b) => GameDataManager.parseGameId(b.game_id) - GameDataManager.parseGameId(a.game_id))
        // const sortedGamemasterGames = [...invitedUserProfile.gamemasterGames].sort((a, b) => GameDataManager.parseGameId(b.game_id) - GameDataManager.parseGameId(a.game_id))
        
        // const upcomingGame = sortedUpcomingGames.length > 0 
        //     ? `[${sortedUpcomingGames[0].title}](https://discord.com/channels/744899300277878796/${sortedUpcomingGames[0].game_id}/${sortedUpcomingGames[0].game_id})`
        //     : "Не записан"

        // const lastPlayedGame = sortedGameHistory.length > 0 
        //     ? `[${sortedGameHistory[0].title}](https://discord.com/channels/744899300277878796/${sortedGameHistory[0].game_id}/${sortedGameHistory[0].game_id})`
        //     : "Нет данных"

        // const lastGamemasterGame = sortedGamemasterGames.length > 0 
        //     ? `[${sortedGamemasterGames[0].title}](https://discord.com/channels/744899300277878796/${sortedGamemasterGames[0].game_id}/${sortedGamemasterGames[0].game_id})`
        //     : "Нет данных"

        // const invitedUsersCount = UserProfile.getInvitedUsers(invitedUserID).length

        let favoriteCharacterInfo = "Не определен"
        if (invitedUserProfile.favoriteCharacter) {
            const character = FindCharacterByID(invitedUserProfile.favoriteCharacter, null)
            if (character) {
                const emoji = character.emoji ? `<:${character.emoji}>` : ""
                const characterNameEncoded = encodeURIComponent(character.name)
                favoriteCharacterInfo = `${emoji} [${character.name}](https://www.google.com/search?q=${characterNameEncoded})`
            }
        }

        const cleanName = invitedUser.name.replace(/#0$/, '')
        
        let inviterInfo = "Неизвестно"
        try {
            const inviterUser = await UserCacheHelper.getUser(interaction.client, targetUserID)
            inviterInfo = `[**\`${inviterUser.username}\`**](https://discordredirect.discordsafe.com/users/${targetUserID})`
        } catch (error) {
            console.log(`Не удалось получить информацию о пригласившем пользователе ${targetUserID}`)
        }
        
        let invitedUserAvatarURL = null
        try {
            const invitedUserMember = await UserCacheHelper.getUser(interaction.client, invitedUserID)
            invitedUserAvatarURL = invitedUserMember.displayAvatarURL()
        } catch (error) {
            console.log(`Не удалось получить аватар пользователя ${invitedUserID}`)
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`<:Profile:1441500773698502666> Информация о приглашенном пользователе`)
            .setDescription(`• Имя: [**\`${cleanName}\`**](https://discordredirect.discordsafe.com/users/${invitedUser.id}) (\`${invitedUser.id}\`)\n• SteamID: **${invitedUserProfile.steamID ? `[${invitedUserProfile.steamID}](https://steamcommunity.com/profiles/${SteamIDTo64(invitedUserProfile.steamID)})` : "Не установлен"}**`)
            .addFields(
                {
                    name: "<:Latter:1305124712170389524> Информация о приглашении:",
                    value: `Пригласил: ${inviterInfo} (\`${targetUserID}\`)\nДата приглашения: **${inviteDate}**\nВремя приглашения: **${inviteTime}**\nКод инвайта: **${invitedUser.inviteCode}**`,
                    inline: false
                },
                // {
                //     name: "Текущая активность:",
                //     value: `Предстоящая игра: **${upcomingGame}**\nПоследняя сыгранная игра: **${lastPlayedGame}**\nПоследняя проведенная игра: **${lastGamemasterGame}**\nПриглашено пользователей: **${invitedUsersCount} человек**\nСамый частый персонаж: **${favoriteCharacterInfo}**`,
                //     inline: false
                // },
                // {
                //     name: "Общая статистика:",
                //     value: `Сыграно игр: **${userGames.length}**\nПроведено игр: **${invitedUserProfile.gamemasterGames.length}**\nПредстоящих игр: **${userUpcomingGames.length}**`,
                //     inline: false
                // }
            )
            .setColor([47, 49, 54])

        if (invitedUserAvatarURL) {
            embed.setThumbnail(invitedUserAvatarURL)
        }

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                // new ButtonBuilder()
                //     .setCustomId(`navigation.profile.invited.player.games/${invitedUserID}`)
                //     .setLabel("Сыгранные игры")
                //     .setStyle(ButtonStyle.Secondary),
                // new ButtonBuilder()
                //     .setCustomId(`navigation.profile.gamemaster/${invitedUserID}`)
                //     .setLabel("Проводимые игры")
                //     .setStyle(ButtonStyle.Secondary)
                //     .setDisabled(gamemasterGamesCount === 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile/${invitedUserID}`)
                    .setLabel("Игровой профиль")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.invited/${targetUserID}`)
                    .setLabel("Назад к списку приглашенных пользователей")
                    .setStyle(ButtonStyle.Primary)
            )

        await interaction.editReply({ content: "", embeds: [embed], components: [row], files: [] })
    }
}

export default selectMenu