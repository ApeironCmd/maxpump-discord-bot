import { Button } from "../types"

const button : Button = {
    customId: "navigation.profile.gamemaster.page",
    execute: async (interaction, profileID, page) => {
        const mainButton = await import("./Navigation.Profile.Gamemaster")
        await mainButton.default.execute(interaction, profileID, page)
    }
}

export default button