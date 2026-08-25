import { SelectMenu } from "../types"

const selectMenu : SelectMenu = {
    customId: "navigation.profile.likes.given.select",
    execute: async (interaction) => {
        const selectedUserID = interaction.values[0]
        
        await interaction.deferUpdate()
        
        const profileButton = await import("../buttons/Navigation.Profile")

        //@ts-ignore
        await profileButton.default.execute(interaction, selectedUserID)
    }
}

export default selectMenu