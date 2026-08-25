import { Button } from "../types"
import { GetData, SetData } from "../structures/Data"

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
    customId: "navigation.profile.rate",
    execute: async (interaction, targetUserID) => {        
        const userID = interaction.user.id
        const targetID = targetUserID as string
        
        if (userID === targetID) {
            const profileButton = await import("./Navigation.Profile")
            await profileButton.default.execute(interaction, targetID)
            return
        }
        
        const profilesData: ProfilesData = GetData("profiles", {})
        
        if (!profilesData[targetID]) {
            profilesData[targetID] = {}
        }
        
        if (!profilesData[targetID].rating) {
            profilesData[targetID].rating = { likes: [] }
        }
        
        const likes = profilesData[targetID].rating!.likes || []
        const hasLiked = likes.includes(userID)
        
        if (hasLiked) {
            profilesData[targetID].rating!.likes = likes.filter(id => id !== userID)
        } else {
            profilesData[targetID].rating!.likes.push(userID)
        }
        
        SetData("profiles", profilesData)

        const profileButton = await import("./Navigation.Profile")
        await profileButton.default.execute(interaction, targetID)
    }
}

export default button 