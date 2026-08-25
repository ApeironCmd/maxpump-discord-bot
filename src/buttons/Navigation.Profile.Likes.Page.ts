import { Button } from "../types"

const button : Button = {
    customId: "navigation.profile.likes.page",
    execute: async (interaction, profileID, page) => {
        const mainButton = await import("./Navigation.Profile.Likes")
        await mainButton.default.execute(interaction, profileID, page)
    }
}

export default button