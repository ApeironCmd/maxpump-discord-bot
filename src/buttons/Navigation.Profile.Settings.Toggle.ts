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
    customId: "navigation.profile.settings.toggle",
    execute: async (interaction, newState) => {
        const userID = interaction.user.id
        const hideProfile = newState === "true"
        
        const profilesData: ProfilesData = GetData("profiles", {})
        
        if (!profilesData[userID]) {
            profilesData[userID] = {}
        }
        
        profilesData[userID].hide_profile = hideProfile
        SetData("profiles", profilesData)

        const settingsButton = await import("./Navigation.Profile.Settings")
        await settingsButton.default.execute(interaction)
    }
}

export default button 