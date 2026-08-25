import { Button } from "../types"

const button : Button = {
    customId: "navigation.profile.played.page",
    execute: async (interaction, page) => {
        const mainButton = await import("./Navigation.Profile.Played")
        await mainButton.default.execute(interaction, page)
    }
}

export default button