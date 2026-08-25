import { SlashCommandBuilder } from "discord.js"
import { SlashCommand } from "../types"

const command : SlashCommand = {
    command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("ping"),
    execute: async (interaction) => {
        interaction.reply({content: "Pong!", ephemeral: true})
    }
}

export default command