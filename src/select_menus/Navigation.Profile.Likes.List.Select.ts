import { SelectMenu } from "../types"

const selectMenu : SelectMenu = {
    customId: "navigation.profile.likes.list.select",
    execute: async (interaction, profileID) => {
        const selectedUserID = interaction.values[0]
        
        await interaction.deferUpdate()
        
        const profileButton = await import("../buttons/Navigation.Profile")

        //@ts-ignore
        await profileButton.default.execute(interaction, selectedUserID)
    }
}

export default selectMenu