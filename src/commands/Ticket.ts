import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import { SlashCommand } from "../types"

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Система тикетов для MAX-PUMP")
        .setDMPermission(false)
        .addSubcommand(sub =>
            sub
                .setName("create")
                .setDescription("Создать новый тикет")
        )
        .addSubcommand(sub =>
            sub
                .setName("close")
                .setDescription("Закрыть существующий тикет")
        )
        .addSubcommand(sub =>
            sub
                .setName("adduser")
                .setDescription("Добавить пользователя в тикет")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Пользователь, которого нужно добавить в тикет")
                        .setRequired(true)
                )
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const subCommand = interaction.options.getSubcommand()

        const command = interaction.client.subcommands.get(`${interaction.commandName}.${subCommand}`)
        if (!command) return

        command.execute(interaction)
    }
}

export default command