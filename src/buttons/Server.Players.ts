import {
    ButtonInteraction,
    EmbedBuilder,
} from "discord.js"
import { Button } from "../types"
import Gamedig from "gamedig"

interface ServerStatus {
    name: string
    map: string
    players: number
    maxPlayers: number
    game: string
    online: boolean
    infoPlayers: any[]
}

const button: Button = {
    customId: "server.players",
    execute: async (interaction: ButtonInteraction, serverIp?: string) => {
        if (!serverIp) return

        await interaction.deferReply({ ephemeral: true })

        try {
            const status = await getServerStatus(serverIp)

            const embed = createPlayersEmbed(serverIp, status)

            await interaction.editReply({ embeds: [embed] })
        } catch (error) {
            console.log(error)

            const embed = new EmbedBuilder()
                .setColor([255, 0, 0])
                .setTitle("❌ Ошибка")
                .setDescription("Не удалось получить информацию о сервере")

            await interaction.editReply({ embeds: [embed] })
        }
    }
}

async function getServerStatus(ip: string): Promise<ServerStatus> {
    return new Promise((resolve, reject) => {
        Gamedig.query({
            type: "garrysmod",
            host: ip,
            requestRules: true,
        }).then((state) => {
            resolve({
                name: state.name,
                map: state.map,
                players: state.players.length,
                maxPlayers: state.maxplayers,
                game: state.raw["game"] || "Unknown",
                online: true,
                infoPlayers: state.players
            })
        }).catch((error) => {
            reject(error)
        })
    })
}

function formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
        return `${hours} ч. ${minutes} мин.`
    } else {
        return `${minutes} мин.`
    }
}

function createPlayersEmbed(serverIp: string, status: ServerStatus): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle(`<:local:1305127102777004042> Игроки на сервере`)
        .setColor([47, 49, 54])
        .addFields(
            { name: "<:globe:1433519536644034713> Сервер", value: "`" + serverIp + "`", inline: true },
            { name: "<:player:1433519563945021480> Онлайн", value: "`" + `${status.players}/${status.maxPlayers}` + "`", inline: true },
            { name: "<:map:1433519549961080872> Карта", value: "`" + status.map + "`", inline: true },
        )
        .setTimestamp()

    if (status.infoPlayers && status.infoPlayers.length > 0) {
        let currentList = ""
        let fieldCount = 0

        const maxLength = 1024
        const maxFields = 25
        
        for (let i = 0; i < status.infoPlayers.length; i++) {
            const player = status.infoPlayers[i]
            const playTimeSeconds = player.raw?.time || 0
            const formattedTime = formatPlayTime(playTimeSeconds)
            const playerEntry = `${i + 1}. **${player.name}**\n<:time:1433520349596877010> ${formattedTime}\n\n`
            
            if (currentList.length + playerEntry.length > maxLength) {
                if (fieldCount >= maxFields - 4) {
                    currentList += `\n... и еще ${status.infoPlayers.length - i} игроков`
                    break
                }
                
                const fieldName = fieldCount === 0 
                    ? "<:clipboard:1433520210459234435> Список игроков"
                    : " "
                const inline = fieldCount === 0 ? false : true
                
                embed.addFields({
                    name: fieldName,
                    value: currentList,
                    inline: inline
                })
                currentList = playerEntry
                fieldCount++
            } else {
                currentList += playerEntry
            }
        }
        
        if (currentList.length > 0) {
            const fieldName = fieldCount === 0 
                ? "<:clipboard:1433520210459234435> Список игроков"
                : " "
            const inline = fieldCount === 0 ? false : true
            
            embed.addFields({
                name: fieldName,
                value: currentList,
                inline: inline
            })
        }
    } else {
        embed.addFields({
            name: "<:clipboard:1433520210459234435> Список игроков",
            value: "На сервере нет игроков",
            inline: false
        })
    }

    return embed
}

export default button