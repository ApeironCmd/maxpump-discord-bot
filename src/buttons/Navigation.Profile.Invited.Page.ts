import { Button } from "../types"

const button : Button = {
    customId: "navigation.profile.invited.page",
    execute: async (interaction, profileID, page) => {
        const mainButton = await import("./Navigation.Profile.Invited")
        await mainButton.default.execute(interaction, profileID, page)
    }
}

export default button