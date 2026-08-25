import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ButtonInteraction, CommandInteraction, StringSelectMenuBuilder } from "discord.js"
import { Button } from "../types"
import { UserProfile } from "../structures/UserProfile"
import { FindCharacterByID } from "../structures/GameCharacters"
import { SteamIDTo64 } from "../structures/SteamID"
import { GameDataManager } from "../structures/GameDataManager"
import { GetData, SetData } from "../structures/Data"
import { UserCacheHelper } from "../structures/UserCacheHelper"
import { existsSync } from "fs"
import { join } from "path"

interface InviteData {
    name: string
    timestamp: number
    inviteCode: string
}

interface InvitesData {
    [inviterID: string]: {
        [invitedID: string]: InviteData
    }
}

interface ProfileSettings {
    hide_profile?: boolean
    rating?: {
        likes: string[]
    }
}

interface ProfilesData {
    [userID: string]: ProfileSettings
}

export function getCharacterBannerImagePath(characterUniqueID: string): string | null {
    const basePath = join(__dirname, "../../assets/characters")
    const extensions = ['.png', '.jpg', '.jpeg', '.gif']
    
    for (const ext of extensions) {
        const fullPath = join(basePath, `${characterUniqueID}_profile${ext}`)

        if (existsSync(fullPath)) {
            return fullPath
        }
    }
    
    return null
}

export function getCharacterImagePath(characterUniqueID: string): string | null {
    const basePath = join(__dirname, "../../assets/characters")
    const extensions = ['.png', '.jpg', '.jpeg', '.gif']
    
    for (const ext of extensions) {
        const fullPath = join(basePath, `${characterUniqueID}${ext}`)

        if (existsSync(fullPath)) {
            return fullPath
        }
    }
    
    return null
}

const button : Button = {
    customId: "navigation.profile",
    execute: async (interaction: ButtonInteraction | CommandInteraction, profileID?: string) => {
        const isButtonInteraction = interaction.isButton()
        const isCommandInteraction = interaction.isCommand()
        
        const targetUserID = profileID as string || interaction.user.id
        const isOwnProfile = targetUserID === interaction.user.id
        
        if (isButtonInteraction) {
            const isFromEphemeral = interaction.message && interaction.message.reference
            if (isFromEphemeral) {
                await interaction.deferUpdate()
            } else {
                await interaction.deferReply({ ephemeral: true })
            }
        } else if (isCommandInteraction) {
            await interaction.deferReply({ ephemeral: true })
        }

        const profilesData: ProfilesData = GetData("profiles", {})
        const targetProfileSettings = profilesData[targetUserID] || {}
        
        if (targetProfileSettings.hide_profile && !isOwnProfile) {
            const embed = new EmbedBuilder()
                .setTitle("Профиль скрыт")
                .setDescription("Пользователь скрыл свой профиль от других людей.")
                .setColor([255, 0, 0])

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("navigation.profile")
                        .setLabel("Вернуться к себе")
                        .setStyle(ButtonStyle.Primary)
                )

            if (isCommandInteraction) {
                await interaction.editReply({ embeds: [embed], components: [row] })
            } else {
                await interaction.editReply({ content: "", embeds: [embed], components: [row] })
            }
            return
        }
        
        const profile = UserProfile.getFullProfile(targetUserID)

        let favoriteCharacterInfo = "Не определен"
        let characterImagePath: string | null = null
        if (profile.favoriteCharacter) {
            const character = FindCharacterByID(profile.favoriteCharacter, null)
            if (character) {
                const emoji = character.emoji ? `<:${character.emoji}>` : ""
                const characterNameEncoded = encodeURIComponent(character.name)
                favoriteCharacterInfo = `${emoji} [${character.name}](https://www.google.com/search?q=${characterNameEncoded})`

                characterImagePath = getCharacterBannerImagePath(character.uniqueID)
            }
        }

        const upcomingGames = profile.upcomingGames
        const gameHistory = profile.gameHistory
        const gamemasterGames = profile.gamemasterGames

        const sortedUpcomingGames = [...upcomingGames].sort((a, b) => GameDataManager.parseGameId(b.game_id) - GameDataManager.parseGameId(a.game_id))
        const sortedGameHistory = [...gameHistory].sort((a, b) => GameDataManager.parseGameId(b.game_id) - GameDataManager.parseGameId(a.game_id))
        const sortedGamemasterGames = [...gamemasterGames].sort((a, b) => GameDataManager.parseGameId(b.game_id) - GameDataManager.parseGameId(a.game_id))

        const upcomingGame = sortedUpcomingGames.length > 0 
            ? `[${sortedUpcomingGames[0].title}](https://discord.com/channels/744899300277878796/${sortedUpcomingGames[0].game_id}/${sortedUpcomingGames[0].game_id})`
            : "Не записан"

        const lastPlayedGame = sortedGameHistory.length > 0 
            ? `[${sortedGameHistory[0].title}](https://discord.com/channels/744899300277878796/${sortedGameHistory[0].game_id}/${sortedGameHistory[0].game_id})`
            : "Нет данных"

        const lastGamemasterGame = sortedGamemasterGames.length > 0 
            ? `[${sortedGamemasterGames[0].title}](https://discord.com/channels/744899300277878796/${sortedGamemasterGames[0].game_id}/${sortedGamemasterGames[0].game_id})`
            : "Нет данных"

        const invitedUsers = profile.invitedUsers
        const inviteCount = invitedUsers ? invitedUsers.length : 0

        const likesCount = targetProfileSettings.rating?.likes?.length || 0
        const hasLiked = targetProfileSettings.rating?.likes?.includes(interaction.user.id) || false

        let givenLikesCount = 0
        if (isOwnProfile) {
            for (const [otherUserID, settings] of Object.entries(profilesData)) {
                if (otherUserID !== targetUserID && settings.rating?.likes?.includes(targetUserID)) {
                    givenLikesCount++
                }
            }
        }

        let inviterInfo = null
        const invitesData: InvitesData = GetData("invites_count", {})
        
        let earliestInvite: { inviterID: string, data: InviteData } | null = null
        
        for (const [inviterID, invitedUsers] of Object.entries(invitesData)) {
            if (invitedUsers[targetUserID]) {
                const inviteData = invitedUsers[targetUserID]
                if (!earliestInvite || inviteData.timestamp < earliestInvite.data.timestamp) {
                    earliestInvite = {
                        inviterID: inviterID,
                        data: inviteData
                    }
                }
            }
        }

        if (earliestInvite) {
            try {
                const inviterUser = await UserCacheHelper.getUser(interaction.client, earliestInvite.inviterID)
                const inviteDate = new Date(earliestInvite.data.timestamp).toLocaleDateString('ru-RU')
                const inviteTime = new Date(earliestInvite.data.timestamp).toLocaleTimeString('ru-RU')
                
                inviterInfo = {
                    name: inviterUser.username,
                    id: earliestInvite.inviterID,
                    date: inviteDate,
                    time: inviteTime,
                    code: earliestInvite.data.inviteCode
                }
            } catch (error) {
                console.log(`Не удалось получить информацию о пригласившем пользователе ${earliestInvite.inviterID}`)
            }
        }

        let targetUser = interaction.user
        let targetUserAvatarURL = interaction.user.displayAvatarURL()
        
        if (!isOwnProfile) {
            try {
                targetUser = await UserCacheHelper.getUser(interaction.client, targetUserID)
                targetUserAvatarURL = targetUser.displayAvatarURL()
            } catch (error) {
                console.log(`Не удалось получить информацию о пользователе ${targetUserID}`)
            }
        }

        let nameField = "<:Praise:1441500796217982996> Похвала и лайки:"
        let valueField = `<:Like:1441500885665714316> Получено лайков: **${likesCount}**\n${isOwnProfile ? `Поставлено лайков: **${givenLikesCount}**` : ""}`

        if (targetUserID == "1271409852555591681") {
            nameField = "🐻 Похвала и ГриззлиХантеры"
            valueField = `🐻 Получено ГриззлиХантеров: **${likesCount}**\n${isOwnProfile ? `Поставлено ГриззлиХантеров: **${givenLikesCount}**` : ""}`
        } else if (targetUserID == "369151338652762112") {
            nameField = "👎🏻 Хейт и Дизлайки"
            valueField = `👎🏻 Получено Дизлайков: **${likesCount}**\n${isOwnProfile ? `Поставлено Дизлайков: **${givenLikesCount}**` : ""}`
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`<:Profile:1441500773698502666> Игровой профиль ${targetUser.username}`)
            .setDescription(`• Имя: [**\`${targetUser.username}\`**](https://discordredirect.discordsafe.com/users/${targetUser.id}) (\`${targetUser.id}\`)\n• SteamID: **${profile.steamID ? `[${profile.steamID}](https://steamcommunity.com/profiles/${SteamIDTo64(profile.steamID)})` : "Не установлен"}**`)
            .addFields(
                {
                    name: "<:Status:1441500601753014292> Текущая активность:",
                    value: `Предстоящая игра: **${upcomingGame}**\nПоследняя сыгранная игра: **${lastPlayedGame}**\nПоследняя проведенная игра: **${lastGamemasterGame}**\nПриглашено пользователей: **${inviteCount} человек**\nСамый частый персонаж: **${favoriteCharacterInfo}**`,
                    inline: false
                },
                {
                    name: "<:Clipboard:1433520210459234435> Общая статистика:",
                    value: `Предстоящих игр: **${profile.upcomingGames.length}**\nСыграно игр: **${profile.gameHistory.length}**\nПроведено игр: **${profile.gamemasterGames.length}**`,
                    inline: true
                },
                {
                    name: nameField,
                    value: valueField,
                    inline: true
                }
            )
            .setColor([47, 49, 54])
            .setThumbnail(targetUserAvatarURL)

        if (characterImagePath) {
            embed.setImage(`attachment://${characterImagePath.split('/').pop()}`)
        }

        if (inviterInfo) {
            embed.addFields({
                name: "<:Latter:1305124712170389524> Информация о первом приглашении:",
                value: `Пригласил: [**\`${inviterInfo.name}\`**](https://discordredirect.discordsafe.com/users/${inviterInfo.id}) (\`${inviterInfo.id}\`)\nДата приглашения: **${inviterInfo.date}**\nВремя приглашения: **${inviterInfo.time}**\nКод инвайта: **${inviterInfo.code}**`,
                inline: false
            })
        }

        const rows: ActionRowBuilder<ButtonBuilder>[] = []
        const row1 = new ActionRowBuilder<ButtonBuilder>()
        
        if (isOwnProfile) {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId("user.steamid.set")
                    .setLabel("Изменить SteamID")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("navigation.profile.settings")
                    .setLabel("Настройки профиля")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.likes/${targetUserID}`)
                    .setLabel("Лайки")
                    .setStyle(ButtonStyle.Success)
            )
        } else {
            let labelName = hasLiked ? "🤍 Убрать лайк" : "🤍 Поставить лайк"
            if (targetUserID == "1271409852555591681") {
                labelName = hasLiked ? "🐻 Убрать ГриззлиХантера" : "🐻 Поставить ГриззлиХантера"
            } else if (targetUserID == "369151338652762112") {
                labelName = hasLiked ? "👎🏻 Убрать Дизлайк" : "👎🏻 Поставить Дизлайк"
            }

            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.rate/${targetUserID}`)
                    .setLabel(labelName)
                    .setStyle(hasLiked ? ButtonStyle.Danger : ButtonStyle.Success)
            )
        }

        rows.push(row1)

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.played/${targetUserID}`)
                    .setLabel("Сыгранные игры")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(profile.gameHistory.length === 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.invited/${targetUserID}`)
                    .setLabel("Приглашенные")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(inviteCount === 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.gamemaster/${targetUserID}`)
                    .setLabel("Проводимые игры")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(profile.gamemasterGames.length === 0)
            )

        if (!isOwnProfile) {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId("navigation.profile")
                    .setLabel("Вернуться к себе")
                    .setStyle(ButtonStyle.Primary)
            )
        }

        rows.push(row2)

        const files = characterImagePath ? [characterImagePath] : []

        if (isCommandInteraction) {
            await interaction.editReply({ embeds: [embed], components: rows, files: files })
        } else {
            await interaction.editReply({ content: "", embeds: [embed], components: rows, files: files })
        }
    }
}

export default button