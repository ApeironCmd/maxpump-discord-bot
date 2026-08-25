import { Button } from "../types"

const button : Button = {
    customId: "navigation.profile.likes.given.page",
    execute: async (interaction, profileID, page) => {
        const mainButton = await import("./Navigation.Profile.Likes.Given")
        await mainButton.default.execute(interaction, profileID, page)
    }
}

export default button