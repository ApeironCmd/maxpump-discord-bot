import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { SlashCommand } from "../types"
import Gamedig from 'gamedig'
import { FindServerByID } from "../structures/Server"

const command : SlashCommand = {
    command: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Получить информацию о сервере")
    .addIntegerOption(option =>
        option.setName("server_id")
            .setRequired(true)
            .setDescription("Номер сервера")
            .setMinValue(1)
            .setMaxValue(4)
    )
    ,
    execute: async (interaction) => {
        const server_id : number = Number(interaction.options.get("server_id").value)

        const server = FindServerByID(server_id)
        if (!server) return interaction.reply({content: "Упс... что-то пошло не так. (server is undefined)", ephemeral: true})

        await interaction.deferReply()

        Gamedig.query({type: 'garrysmod', host: server.ip}).then(async (state) => {
            const embedServer = new EmbedBuilder()
                .setTitle(state.name)
                .setColor([47,49,54])
                .addFields(
                    {name: "Прямое подключение:", value: `[${server.ip}](http://${server.ip}/connect)`, inline: true},
                    {name: "Режим:", value: "`" + state.raw["game"] + "`", inline: true},
                    {name: "Карта:", value: "`" + state.map + "`", inline: true},
                    {name: "Количество игроков:", value: `${state.raw["numplayers"]}/${state.maxplayers}`, inline: true},
                )
            
            let array = []
            state.players.forEach(player => {
                array.push({name: " ", value: `${player.name || "connection..."} (${(Math.floor(player.raw["time"] / 60 / 60))} часов)`, inline: true})
            })

            const embedPlayers = new EmbedBuilder()
                .setColor([47,49,54])
                .setDescription("**Информация об игроках на сервере:**")

            embedPlayers.data.fields = array
            
            interaction.editReply({embeds: [embedServer, embedPlayers]})
        }).catch(async (error) => {
            await interaction.editReply({content: "Сервер не отвечает"})
        })
    },
    cooldown: 60,
}

export default command