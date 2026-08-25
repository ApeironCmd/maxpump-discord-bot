import { GetData } from "./Data"
import { GameComponent } from "./Game"
import charactersList from "./GameCharacters"

export interface InvitedUser {
    id: string
    name: string
    timestamp: number
    inviteCode: string
}

export interface UserProfileData {
    favoriteCharacter: string
    upcomingGames: GameComponent[]
    gameHistory: GameComponent[]
    invitedUsers: InvitedUser[]
    steamID: string
    gamemasterGames: GameComponent[]
}

export class UserProfile {
    public static getFavoriteCharacter(userID: string): string | null {
        const games: { [key: string]: GameComponent } = GetData("games", {})
        const gamesArchive: { [key: string]: GameComponent } = GetData("games_archive", {})
        
        const registeredCharacters = this.getRegisteredCharacters()
        
        const characterCount: { [characterID: string]: number } = {}
        
        Object.values(games).forEach(game => {
            if (game && game.users) {
                const user = Object.values(game.users).find(u => u.id === userID)
                if (user && user.character) {
                    characterCount[user.character] = (characterCount[user.character] || 0) + 1
                }
            }
        })
        
        Object.values(gamesArchive).forEach(game => {
            if (game && game.users) {
                const user = Object.values(game.users).find(u => u.id === userID)
                if (user && user.character) {
                    characterCount[user.character] = (characterCount[user.character] || 0) + 1
                }
            }
        })
        
        let favoriteCharacter: string | null = null
        let maxCount = 0
        
        Object.entries(characterCount).forEach(([characterID, count]) => {
            if (registeredCharacters.has(characterID) && count > maxCount) {
                maxCount = count
                favoriteCharacter = characterID
            }
        })
        
        return favoriteCharacter
    }
    
    public static getUpcomingGames(userID: string): GameComponent[] {
        const games: { [key: string]: GameComponent } = GetData("games", {})
        const upcomingGames: GameComponent[] = []
        
        Object.values(games).forEach(game => {
            if (game && game.users) {
                const user = Object.values(game.users).find(u => u.id === userID)
                if (user && (user.status === 1 || user.status === 2 || user.status === 3)) {
                    upcomingGames.push(game)
                }
            }
        })
        
        return upcomingGames
    }
    
    public static getGameHistory(userID: string): GameComponent[] {
        const gamesArchive: { [key: string]: GameComponent } = GetData("games_archive", {})
        const gameHistory: GameComponent[] = []
        
        Object.values(gamesArchive).forEach(game => {
            if (game && game.users) {
                const user = Object.values(game.users).find(u => u.id === userID)
                if (user && (user.status === 2 || user.status === 3)) {
                    gameHistory.push(game)
                }
            }
        })
        
        return gameHistory
    }
    
    public static getGamemasterGames(userID: string): any[] {
        const gamesArchive: { [key: string]: any } = GetData("games_archive", {})
        const currentGames: { [key: string]: any } = GetData("games", {})
        
        const allGames = { ...gamesArchive, ...currentGames }
        
        let gamemasterGames = []
        
        for (const [gameId, game] of Object.entries(allGames)) {
            if (!game) continue
            
            if (game.gamemaster && game.gamemaster.id === userID) {
                gamemasterGames.push(game)
            }
        }
        
        return gamemasterGames.sort((a, b) => {
            return b.game_id.localeCompare(a.game_id)
        })
    }
    
    public static getInvitedUsers(userID: string): InvitedUser[] {
        const invitesCount: { [key: string]: { [key: string]: InvitedUser } } = GetData("invites_count", {})
        const userInvites = invitesCount[userID]
        
        if (!userInvites) return []

        return Object.values(userInvites).map(invite => ({
            id: Object.keys(userInvites).find(key => userInvites[key] === invite) || '',
            name: invite.name,
            timestamp: invite.timestamp,
            inviteCode: invite.inviteCode
        }))
    }
    
    public static getSteamID(userID: string): string {
        const usersSteamID: { [key: string]: string } = GetData("users_steamid", {})
        return usersSteamID[userID] || ""
    }
    
    public static getFullProfile(userID: string): UserProfileData {
        return {
            favoriteCharacter: this.getFavoriteCharacter(userID),
            upcomingGames: this.getUpcomingGames(userID),
            gameHistory: this.getGameHistory(userID),
            invitedUsers: this.getInvitedUsers(userID),
            steamID: this.getSteamID(userID),
            gamemasterGames: this.getGamemasterGames(userID)
        }
    }
    
    private static getRegisteredCharacters(): Set<string> {
        const registeredCharacters = new Set<string>()
        
        charactersList.forEach(character => {
            if (character.uniqueID) {
                registeredCharacters.add(character.uniqueID)
            }
        })
        
        return registeredCharacters
    }
}