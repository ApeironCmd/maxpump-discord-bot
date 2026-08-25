import { Button } from "../types"
import { GameComponent, UserComponent } from "../structures/Game"
import { showRatingPage } from "./Game.Rating.Start"
import { GetData } from "../structures/Data"

interface ProfileSettings {
    hide_profile?: boolean
    rating?: {
        likes: string[]
    }
}

interface ProfilesData {
    [userID: string]: ProfileSettings
}

const button : Button = {
    customId: "game.rating.page",
    execute: async (interaction, gameID, page) => {
        await interaction.deferUpdate()
        
        const currentUserID = interaction.user.id
        
        let game: GameComponent | null = null
        interaction.client.games.forEach(g => {
            if (g.game_id === gameID) {
                game = g
            }
        })

        if (!game) {
            await interaction.editReply({ 
                content: "Игра не найдена."
            })
            return
        }

        const profilesData: ProfilesData = GetData("profiles", {})
        
        const usersILiked = new Set<string>()
        for (const [targetUserID, settings] of Object.entries(profilesData)) {
            if (settings.rating?.likes?.includes(currentUserID)) {
                usersILiked.add(targetUserID)
            }
        }

        const otherUsers: UserComponent[] = []
        
        if (game.gamemaster.id !== currentUserID && !usersILiked.has(game.gamemaster.id)) {
            otherUsers.push({
                ...game.gamemaster,
                status: 2,
                character: null,
                characters: [],
                time: "",
                avatarURL: game.gamemaster.avatarURL || ""
            })
        }

        game.admins.forEach(admin => {
            if (admin.id !== currentUserID && !usersILiked.has(admin.id)) {
                otherUsers.push({
                    ...admin,
                    status: 2,
                    character: null,
                    characters: [],
                    time: "",
                    avatarURL: admin.avatarURL || ""
                })
            }
        })

        game.users.forEach((user: UserComponent) => {
            if (user.id !== currentUserID && 
                (user.status === 2 || user.status === 3) && 
                !usersILiked.has(user.id)) {
                otherUsers.push(user)
            }
        })

        await showRatingPage(interaction, game, otherUsers, parseInt(page as string))
    }
}

export default button