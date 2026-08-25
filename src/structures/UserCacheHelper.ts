import { Client, User } from "discord.js"

export class UserCacheHelper {
    static async getUsers(client: Client, userIDs: string[]): Promise<Map<string, User>> {
        const users = new Map<string, User>()
        
        for (const userID of userIDs) {
            let user = client.users.cache.get(userID)
            
            if (!user) {
                try {
                    user = await client.users.fetch(userID)
                } catch (error) {
                    console.log(`Не удалось получить пользователя ${userID}`)
                    continue
                }
            }
            
            if (user) {
                users.set(userID, user)
            }
        }
        
        return users
    }

    static async getUser(client: Client, userID: string): Promise<User | null> {
        let user = client.users.cache.get(userID)
        
        if (!user) {
            try {
                user = await client.users.fetch(userID)
            } catch (error) {
                console.log(`Не удалось получить пользователя ${userID}`)
                return null
            }
        }
        
        return user || null
    }
}