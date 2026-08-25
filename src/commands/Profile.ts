import { SlashCommandBuilder } from "discord.js"
import { SlashCommand } from "../types"

const command : SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Просмотреть игровой профиль пользователя")
        .setDMPermission(false)
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Пользователь, чей профиль вы хотите посмотреть")
                .setRequired(false)
        ),
    execute: async (interaction) => {
        const targetUser = interaction.options.getUser("user") || interaction.user
        
        const profileButton = await import("../buttons/Navigation.Profile")

        //@ts-ignore
        await profileButton.default.execute(interaction, targetUser.id)
    }
}

export default command