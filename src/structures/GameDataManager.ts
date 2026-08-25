import { EmbedBuilder } from "discord.js"
import { GetData } from "./Data"
import { DateUtils } from "./DateUtils"
import { FindCharacterByID } from "./GameCharacters"
import { SteamIDTo64 } from "./SteamID"
import { UserProfile } from "./UserProfile"
import { UserCacheHelper } from "./UserCacheHelper"

export interface GameUser {
    id: string
    tag: string
    steam_id: string
    status: number
    character?: string
    characters?: string[]
    messageID?: string
    avatarURL?: string
    time?: string
    needHelp_id?: string
    needHelp_message?: string
}

export interface GameMaster {
    tag: string
    id: string
    steam_id: string
    avatarURL?: string
}

export interface GameData {
    game_id: string
    title: string
    server: string
    create_time: string
    active: boolean
    private?: boolean
    users?: { [key: string]: GameUser }
    gamemaster?: GameMaster
    admins?: {
        [key: string]: {
            id: string;
            tag: string;
            steam_id: string;
            avatarURL?: string;
        };
    };
    gamecharacters?: any[]
}

export class GameDataManager {
    private static readonly ITEMS_PER_PAGE = 25

    public static getGame(gameID: string): GameData | null {
        const gamesArchive: { [key: string]: GameData } = GetData("games_archive", {})
        const games: { [key: string]: GameData } = GetData("games", {})
        return gamesArchive[gameID] || games[gameID] || null
    }

    public static getUserGames(userID: string): { played: GameData[], upcoming: GameData[], gamemaster: GameData[] } {
        const gamesArchive: { [key: string]: GameData } = GetData("games_archive", {})
        const games: { [key: string]: GameData } = GetData("games", {})
        
        const played: GameData[] = []
        const upcoming: GameData[] = []
        const gamemaster: GameData[] = []

        Object.values(gamesArchive).forEach(game => {
            if (game && game.users) {
                const user = Object.values(game.users).find(u => u.id === userID)
                if (user && (user.status === 2 || user.status === 3)) {
                    if (!game.gamemaster || game.gamemaster.id !== userID) {
                        played.push(game)
                    }
                }
            }
        })

        Object.values(games).forEach(game => {
            if (game && game.users) {
                const user = Object.values(game.users).find(u => u.id === userID)
                if (user && (user.status === 2 || user.status === 3)) {
                    if (!game.gamemaster || game.gamemaster.id !== userID) {
                        upcoming.push(game)
                    }
                }
            }
        })

        Object.values(gamesArchive).forEach(game => {
            if (game && game.gamemaster && game.gamemaster.id === userID) {
                gamemaster.push(game)
            }
        })

        Object.values(games).forEach(game => {
            if (game && game.gamemaster && game.gamemaster.id === userID) {
                gamemaster.push(game)
            }
        })

        return { played, upcoming, gamemaster }
    }

    public static getGameUsers(gameID: string): GameUser[] {
        const game = this.getGame(gameID)
        if (!game || !game.users) return []

        return Object.values(game.users)
    }

    public static async generatePlayerInfoContent(player: GameUser, gameTitle?: string, interaction?: any): Promise<EmbedBuilder> {
        const cleanTag = player.tag.replace(/#0$/, '')
        
        const embed = new EmbedBuilder()
            .setTitle(`<:Profile:1441500773698502666> Информация об игроке${gameTitle ? ` в "${gameTitle}"` : ''}`)
            .setColor([47, 49, 54])
            .addFields(
                {
                    name: " ",
                    value: `• Имя: **[\`${cleanTag}\`](https://discordredirect.discordsafe.com/users/${player.id})** (\`${player.id}\`)\n• SteamID: **${player.steam_id ? `[${player.steam_id}](https://steamcommunity.com/profiles/${SteamIDTo64(player.steam_id)})` : "Не установлен"}**`,
                    inline: false
                }
            )

        let playerAvatarURL = null
        try {
            if (interaction && interaction.client) {
                const playerMember = await UserCacheHelper.getUser(interaction.client, player.id)
                playerAvatarURL = playerMember.displayAvatarURL()
            }
        } catch (error) {
            console.log(`Не удалось получить аватар пользователя ${player.id}`)
        }

        if (playerAvatarURL) {
            embed.setThumbnail(playerAvatarURL)
        }

        if (gameTitle) {
            let currentGameInfo = `Статус: **${this.getStatusText(player.status)}**\n`
            
            if (player.character) {
                const character = FindCharacterByID(player.character, null)
                if (character) {
                    const emoji = character.emoji ? `<:${character.emoji}>` : ""
                    const characterNameEncoded = encodeURIComponent(character.name)
                    currentGameInfo += `Основной персонаж: **${emoji} [${character.name}](https://www.google.com/search?q=${characterNameEncoded})**\n`
                }
            }

            if (player.characters && player.characters.length > 0) {
                const charactersList = player.characters.map(charID => {
                    const character = FindCharacterByID(charID, null)
                    if (character) {
                        const emoji = character.emoji ? `<:${character.emoji}>` : ""
                        // const characterNameEncoded = encodeURIComponent(character.name)
                        return `${emoji} ${character.name}`
                    }
                    return charID
                }).join(', ')
                
                currentGameInfo += `Выбранные персонажи: **${charactersList}**`
            }

            if (currentGameInfo.length > 1024) {
                currentGameInfo = currentGameInfo.substring(0, 1021) + '...'
            }

            embed.addFields({
                name: "<:Game:1305168542123036774> В текущей игре:",
                value: currentGameInfo,
                inline: false
            })
        }

        // const upcomingGames = playerProfile.upcomingGames
        // const gameHistory = playerProfile.gameHistory
        // const gamemasterGames = playerProfile.gamemasterGames

        // const sortedUpcomingGames = [...upcomingGames].sort((a, b) => this.parseGameId(b.game_id) - this.parseGameId(a.game_id))
        // const sortedGameHistory = [...gameHistory].sort((a, b) => this.parseGameId(b.game_id) - this.parseGameId(a.game_id))
        // const sortedGamemasterGames = [...gamemasterGames].sort((a, b) => this.parseGameId(b.game_id) - this.parseGameId(a.game_id))

        // const upcomingGame = sortedUpcomingGames.length > 0 
        //     ? `[${sortedUpcomingGames[0].title}](https://discord.com/channels/744899300277878796/${sortedUpcomingGames[0].game_id}/${sortedUpcomingGames[0].game_id})`
        //     : "Не записан"
        
        // const lastPlayedGame = sortedGameHistory.length > 0 
        //     ? `[${sortedGameHistory[0].title}](https://discord.com/channels/744899300277878796/${sortedGameHistory[0].game_id}/${sortedGameHistory[0].game_id})`
        //     : "Нет данных"
        
        // const lastGamemasterGame = sortedGamemasterGames.length > 0 
        //     ? `[${sortedGamemasterGames[0].title}](https://discord.com/channels/744899300277878796/${sortedGamemasterGames[0].game_id}/${sortedGamemasterGames[0].game_id})`
        //     : "Нет данных"

        // const invitedUsers = playerProfile.invitedUsers
        // const inviteCount = invitedUsers ? invitedUsers.length : 0

        // let favoriteCharacterInfo = "Не определен"
        // if (playerProfile.favoriteCharacter) {
        //     const character = FindCharacterByID(playerProfile.favoriteCharacter, null)
        //     if (character) {
        //         const emoji = character.emoji ? `<:${character.emoji}>` : ""
        //         const characterNameEncoded = encodeURIComponent(character.name)
        //         favoriteCharacterInfo = `${emoji} [${character.name}](https://www.google.com/search?q=${characterNameEncoded})`
        //     }
        // }

        // let activityInfo = `Предстоящая игра: **${upcomingGame}**\nПоследняя сыгранная игра: **${lastPlayedGame}**\nПоследняя проведенная игра: **${lastGamemasterGame}**\nПриглашено пользователей: **${inviteCount} человек**\nСамый частый персонаж: **${favoriteCharacterInfo}**`
        
        // // Проверка длины для поля активности
        // if (activityInfo.length > 1024) {
        //     activityInfo = activityInfo.substring(0, 1021) + '...'
        // }

        // embed.addFields({
        //     name: "Текущая активность:",
        //     value: activityInfo,
        //     inline: false
        // })

        // let statsInfo = `Сыграно игр: **${playerProfile.gameHistory.length}**\nПроведено игр: **${playerProfile.gamemasterGames.length}**\nПредстоящих игр: **${playerProfile.upcomingGames.length}**`
        
        // // Проверка длины для поля статистики
        // if (statsInfo.length > 1024) {
        //     statsInfo = statsInfo.substring(0, 1021) + '...'
        // }

        // embed.addFields({
        //     name: "Общая статистика:",
        //     value: statsInfo,
        //     inline: false
        // })

        return embed
    }

    public static generateGameStatsContent(game: GameData): string {
        if (!game.users) return ''

        const users = Object.values(game.users)
        const approved = users.filter(u => u.status === 2).length
        const reserve = users.filter(u => u.status === 3).length
        const pending = users.filter(u => u.status === 1).length
        const rejected = users.filter(u => u.status === 4).length

        let stats = `<:Status:1441500601753014292> **Статистика участников:**\n`
        stats += `Одобрено: **${approved}**\n`
        stats += `В запасе: **${reserve}**\n`
        stats += `На рассмотрении: **${pending}**\n`
        stats += `Отклонено: **${rejected}**\n`
        stats += `Всего: **${users.length}**\n`

        return stats
    }

    public static generateCharactersInfo(game: GameData): string {
        if (!game.gamecharacters || game.gamecharacters.length === 0) return ''
        return `\n**Количество уникальных персонажей:** ${game.gamecharacters.length}`
    }

    public static generateGameInfoContent(game: GameData, userID?: string): EmbedBuilder {
        const userInGame = userID && game.users ? Object.values(game.users).find(u => u.id === userID) : null
        
        const gameTypeEmoji = game.private ? "<:mask:1305219874842218516>" : "<:Globe:1433519536644034713>"
        const gameTypeText = game.private ? "Приватная" : "Официальная"
        
        const embed = new EmbedBuilder()
            .setTitle(`<:Game:1305168542123036774> Информация об игре ${game.title}`)
            .setColor([47, 49, 54])
            .addFields(
                {
                    name: " ",
                    value: `Тип: **${gameTypeEmoji} ${gameTypeText}**\nНазвание: **[${game.title}](https://discord.com/channels/744899300277878796/${game.game_id}/${game.game_id})**\nID игры: **${game.game_id}**\nСервер: **${game.server || "Не указан"}**\nДата создания: **${game.create_time || "Неизвестно"}**\nСтатус: **${game.active ? "Активна" : "Завершена"}**`,
                    inline: false
                }
            )

        if (game.gamemaster) {
            if (typeof game.gamemaster === 'object') {
                const cleanGamemasterTag = game.gamemaster.tag.replace(/#0$/, '')
                embed.addFields({
                    name: "Гейммастер:",
                    value: `[\`${cleanGamemasterTag}\`](https://discordredirect.discordsafe.com/users/${game.gamemaster.id}) (\`${game.gamemaster.id}\`)`,
                    inline: false
                })
            } else {
                embed.addFields({
                    name: "Гейммастер:",
                    value: game.gamemaster,
                    inline: false
                })
            }
        }

        if (game.admins) {
            let adminCount = 0
            let adminList = ""
            
            if (game.admins instanceof Map) {
                adminCount = game.admins.size
                if (adminCount > 0) {
                    adminList = Array.from(game.admins.values())
                        .map(admin => {
                            const cleanAdminTag = admin.tag.replace(/#0$/, '')
                            return `[\`${cleanAdminTag}\`](https://discordredirect.discordsafe.com/users/${admin.id}) (\`${admin.id}\`)`
                        })
                        .join(', ')
                }
            } else if (typeof game.admins === 'object') {
                const adminsArray = Object.values(game.admins)
                adminCount = adminsArray.length
                if (adminCount > 0) {
                    adminList = adminsArray
                        .map(admin => {
                            const cleanAdminTag = admin.tag.replace(/#0$/, '')
                            return `[\`${cleanAdminTag}\`](https://discordredirect.discordsafe.com/users/${admin.id}) (\`${admin.id}\`)`
                        })
                        .join(', ')
                }
            }
            
            if (adminCount > 0) {
                embed.addFields({
                    name: "Администраторы:",
                    value: `${adminCount} человек\n${adminList}`,
                    inline: false
                })
            }
        }

        const charactersInfo = GameDataManager.generateCharactersInfo(game)
        if (charactersInfo) {
            embed.addFields({
                name: " ",
                value: charactersInfo,
                inline: false
            })
        }

        if (userInGame) {
            let userInfo = `Имя: [**\`${userInGame.tag.replace(/#0$/, '')}\`**](https://discordredirect.discordsafe.com/users/${userInGame.id}) (\`${userInGame.id}\`)\nСтатус: **${this.getStatusText(userInGame.status)}**\n`
            
            if (userInGame.character) {
                const character = this.formatCharacterInfo(userInGame.character)
                const characterNameEncoded = encodeURIComponent(character.replace(/<:[^:]+:[0-9]+>\s*/, ''))
                userInfo += `Персонаж: **[${character}](https://www.google.com/search?q=${characterNameEncoded})**\n`
            } else {
                userInfo += `Персонаж: **Не выбран**\n`
            }
            
            if (userInGame.characters && userInGame.characters.length > 0) {
                const charactersList = userInGame.characters.map(charID => {
                    const character = this.formatCharacterInfo(charID)
                    // const characterNameEncoded = encodeURIComponent(character.replace(/<:[^:]+:[0-9]+>\s*/, ''))
                    return `${character}`
                }).join(', ')
                userInfo += `Выбранные персонажи: **${charactersList}**\n`
            }

            if (userInfo.length > 1024) {
                userInfo = userInfo.substring(0, 1021) + '...'
            }
            
            embed.addFields({
                name: "<:Player:1433519563945021480> Участие пользователя:",
                value: userInfo,
                inline: true
            })
        }

        const gameStats = GameDataManager.generateGameStatsContent(game) || "Нет данных об участниках"
        const finalGameStats = gameStats.length > 1024 ? gameStats.substring(0, 1021) + '...' : gameStats
        
        embed.addFields({
            name: " ",
            value: finalGameStats,
            inline: true
        })

        return embed
    }

    public static getStatusText(status: number): string {
        const statusMap: { [key: number]: string } = {
            1: "На рассмотрении",
            2: "Одобрен", 
            3: "В запасе",
            4: "Отклонен"
        }
        return statusMap[status] || "Неизвестно"
    }

    private static formatCharacterInfo(characterID: string): string {
        const character = FindCharacterByID(characterID, null)
        if (character) {
            const emoji = character.emoji ? `<:${character.emoji}>` : ""
            return `${emoji} ${character.name}`
        }
        return characterID
    }

    private static formatCharactersList(characters: string[]): string {
        return characters.map(charID => this.formatCharacterInfo(charID)).join(', ')
    }

    public static getPaginatedItems<T>(items: T[], page: number): T[] {
        const startIndex = page * this.ITEMS_PER_PAGE
        const endIndex = startIndex + this.ITEMS_PER_PAGE
        return items.slice(startIndex, endIndex)
    }

    public static getTotalPages(itemsCount: number): number {
        return Math.ceil(itemsCount / this.ITEMS_PER_PAGE)
    }

    public static getUserPlayedGames(userID: string, sortById: boolean = true): any[] {
        const userGames = this.getUserGames(userID)
        let playedGames = userGames.played

        if (sortById) {
            playedGames = this.sortGamesByIdDesc(playedGames)
        }

        return playedGames
    }

    public static getUserGamemasterGames(userID: string, sortById: boolean = true): any[] {
        return UserProfile.getGamemasterGames(userID)
    }

    public static getUserUpcomingGames(userID: string, sortById: boolean = true): any[] {
        const profile = UserProfile.getFullProfile(userID)
        let upcomingGames = profile.upcomingGames

        if (sortById) {
            upcomingGames = this.sortGamesByIdDesc(upcomingGames)
        }

        return upcomingGames
    }

    public static sortGamesById<T extends { game_id: string }>(games: T[], descending: boolean = true): T[] {
        return games.sort((a, b) => {
            const idA = this.parseGameId(a.game_id)
            const idB = this.parseGameId(b.game_id)

            return descending ? idB - idA : idA - idB
        })
    }

    public static parseGameId(gameId: string): number {
        if (/^\d+$/.test(gameId)) {
            return parseInt(gameId, 10)
        }
        
        const numericMatch = gameId.match(/\d+/)
        if (numericMatch) {
            return parseInt(numericMatch[0], 10)
        }
        
        return this.stringHash(gameId)
    }

    private static stringHash(str: string): number {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }

        return Math.abs(hash)
    }

    public static sortGamesByIdDesc<T extends { game_id: string }>(games: T[]): T[] {
        return this.sortGamesById(games, true)
    }

    public static sortGamesByIdAsc<T extends { game_id: string }>(games: T[]): T[] {
        return this.sortGamesById(games, false)
    }
}