import { SlashCommandBuilder } from "discord.js"
import { SlashCommand } from "../types"

const command : SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("moderation")
        .setDescription("Команды для модерации игры")
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName("ban")
                .setDescription("Запретить пользователю записываться на игры на определенный срок")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Пользователь")
                        .setRequired(true) 
                )
                .addIntegerOption(option =>
                    option.setName("days")
                        .setRequired(true)
                        .setDescription("Количество дней")
                        .setMinValue(1)
                        .setMaxValue(365)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("unban")
                .setDescription("Разблокировать пользователю запись на игры")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Пользователь")
                        .setRequired(true) 
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("add_ban")
                .setDescription("Выдать блокировку на игры на определенный срок по уникальному ID")
                .addStringOption(option =>
                    option.setName("unique_id")
                        .setRequired(true)
                        .setDescription("Ваш текст")
                )
                .addIntegerOption(option =>
                    option.setName("days")
                        .setRequired(true)
                        .setDescription("Количество дней")
                        .setMinValue(1)
                        .setMaxValue(365)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove_ban")
                .setDescription("Снять блокировку на игры по уникальному ID")
                .addStringOption(option =>
                    option.setName("unique_id")
                        .setRequired(true)
                        .setDescription("Ваш текст")
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("add_access")
                .setDescription("Выдать доступ к использованию команд модерации")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Пользователь")
                        .setRequired(true) 
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove_access")
                .setDescription("Убрать доступ к использованию команд модерации")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Пользователь")
                        .setRequired(true) 
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("ban_list")
                .setDescription("Вывести список всех заблокированных пользователей")
        ),
    execute: async (interaction) => {
        // @ts-ignore
        const subCommand = interaction.options.getSubcommand()

        const command = interaction.client.subcommands.get(`${interaction.commandName}.${subCommand}`)
        if (!command) return

        command.execute(interaction)
    }
}

export default command