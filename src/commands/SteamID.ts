import { SlashCommandBuilder } from "discord.js"
import { SlashCommand } from "../types"

const command : SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("steamid")
        .setDescription("Команды связанные с SteamID вашего аккаунта")
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName("set")
                .setDescription("Изменить SteamID привязанный к вашему аккаунту")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("my")
                .setDescription("Получить привязанный SteamID к вашему аккаунту")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("get")
                .setDescription("Получить привязанный SteamID пользователя")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Пользователь")
                        .setRequired(true) 
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("find")
                .setDescription("Найти пользователя с привязанным SteamID")
                .addStringOption(option =>
                    option.setName("steamid")
                        .setDescription("SteamID")
                        .setRequired(true) 
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("convert")
                .setDescription("Конвертировать ссылку профиля в SteamID")
                .addStringOption(option =>
                    option.setName("input")
                        .setDescription("Ссылка, SteamID или SteamID64")
                        .setRequired(true)
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