import { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import { SubCommand } from "../types"
import Gamedig from "gamedig"
import { FindServerByName, ServerComponent } from "../structures/Server"

async function createCRSInfo(server : ServerComponent, statusInput : string, callbackSuccessful : Function, callbackFailed? : Function) {
    Gamedig.query({type: 'garrysmod', host: server.ip}).then(async (state) => {
        const embed = new EmbedBuilder()
        .setColor([47,49,54])
            .setTitle(`${server.name} · Asterion Academy`)
            .setDescription(`**Игра**\n${statusInput}`)
            .addFields(
                {name: 'Карта для игры', value: state.map, inline: true},
                {name: 'Кол-во игроков', value: `${state.raw["numplayers"]} из ${state.maxplayers}`, inline: true},
            )

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Подключиться")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`http://${server.ip}/connect`)
            );

        if (callbackSuccessful) callbackSuccessful(embed, row)
    }).catch(async (error) => {
        if (callbackFailed) callbackFailed()
    })
}

const command : SubCommand = {
    id: "game.join",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = interaction.client.games.get(channelID)
        if (!game) return interaction.reply({content: "Данную команду можно использовать только в канале с игрой!", ephemeral: true})

        if (game.gamemaster.id != userID) return interaction.reply({content: "Вы не являетесь игровым мастером данной игры!", ephemeral: true})

        const server = FindServerByName(game.server)
        if (!server) return interaction.reply({content: "Упс... что-то пошло не так. (server is undefined)", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        let message = ""
        game.users.forEach(user => {
            if (user.status == 2) {
                message += `<@!${user.id}> `
            }
        })

        if (message != "") {
            await interaction.channel.send({content: message})
        }

        const gameTitle = game.title
        createCRSInfo(server, gameTitle, async (embed, row) => {
            let messageID = (await interaction.channel.send({embeds: [embed], components: [row]})).id
            await interaction.deleteReply()

            var timerUpdate = setInterval(async () => {
                try {
                    const message = await interaction.channel.messages.fetch(messageID)

                    createCRSInfo(server, gameTitle, async (embed : any, row : any) => {
                        await message.delete()

                        messageID = (await interaction.channel.send({embeds: [embed], components: [row]})).id
                    })
                } catch (err) {
                    clearInterval(timerUpdate)
                }
            }, 300000)
        }, () => {
            interaction.editReply({content: "Сервер не отвечает"})
        })
    }
}

export default command