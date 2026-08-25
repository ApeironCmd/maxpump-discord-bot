import { SlashCommandBuilder } from "discord.js"
import { SlashCommand } from "../types"

const command : SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("game")
        .setDescription("Команды связанные с играми")
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Создать игру")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("rating")
                .setDescription("Уведомить всех пользователей о статусе их заявки")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("notify")
                .setDescription("Уведомить всех пользователей о статусе их заявки")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("join")
                .setDescription("Создать информационное сообщение")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("accept")
                .setDescription("Одобрить рандомных игроков")
                .addIntegerOption(option =>
                    option.setName("number_approved")
                        .setRequired(true)
                        .setMinValue(0)
                        .setDescription("Количество одобренных")
                )
                .addIntegerOption(option =>
                    option.setName("number_reserve")
                        .setRequired(false)
                        .setMinValue(0)
                        .setDescription("Количество запасников")
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("user_setcharacter")
                .setDescription("Изменить основного персонажа у пользователя")
                .addStringOption(option =>
                    option.setName("user_id")
                        .setRequired(true)
                        .setDescription("ID пользователя")
                )
                .addStringOption(option =>
                    option.setName("character_id")
                        .setRequired(true)
                        .setDescription("ID персонажа")
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("user_addcharacter")
                .setDescription("Добавить нового персонажа в выборе пользователя")
                .addStringOption(option =>
                    option.setName("user_id")
                        .setRequired(true)
                        .setDescription("ID пользователя")
                )
                .addStringOption(option =>
                    option.setName("character_id")
                        .setRequired(true)
                        .setDescription("ID персонажа")
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("user_removecharacter")
                .setDescription("Удалить персонажа из выбора пользователя")
                .addStringOption(option =>
                    option.setName("user_id")
                        .setRequired(true)
                        .setDescription("ID пользователя")
                )
                .addStringOption(option =>
                    option.setName("character_id")
                        .setRequired(true)
                        .setDescription("ID персонажа")
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("user_setstatus")
                .setDescription("Изменить статус пользователя")
                .addStringOption(option =>
                    option.setName("user_id")
                        .setRequired(true)
                        .setDescription("ID пользователя")
                )
                .addIntegerOption(option =>
                    option.setName("status_id")
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(4)
                        .setDescription("ID персонажа")
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("user_remove")
                .setDescription("Удалить пользователя полностью из игры")
                .addStringOption(option =>
                    option.setName("user_id")
                        .setRequired(true)
                        .setDescription("ID пользователя")
                )
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