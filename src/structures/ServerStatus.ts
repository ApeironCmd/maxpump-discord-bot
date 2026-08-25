import { Client, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import { GetData } from "./Data"
import Gamedig from "gamedig"

export interface ServerInfo {
    name: string
    description: string
    ip: string
    address: string
    message: string
    icon: string
}

export interface ServerStatus {
    name: string
    map: string
    players: number
    maxPlayers: number
    game: string
    online: boolean
}

export class ServerStatusManager {
    private client: Client
    private updateInterval: NodeJS.Timeout | null = null

    constructor(client: Client) {
        this.client = client
    }

    public startUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval)
        }

        this.updateInterval = setInterval(() => {
            this.updateAllServerStatuses()
        }, 5 * 60 * 1000)

        this.updateAllServerStatuses()
    }

    public stopUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval)
            this.updateInterval = null
        }
    }

    private async updateAllServerStatuses() {
        try {
            const servers: ServerInfo[] = GetData("servers", [])
            
            for (const server of servers) {
                await this.updateServerStatus(server)
            }
        } catch (error) {
            console.error("Ошибка при обновлении статусов серверов:", error)
        }
    }

    private async updateServerStatus(server: ServerInfo) {
        try {
            const status = await this.getServerStatus(server.ip)
            await this.updateServerMessage(server, status)
        } catch (error) {
            console.error(`Ошибка при обновлении статуса сервера ${server.name}:`, error)
            await this.updateServerMessage(server, null)
        }
    }

    private async getServerStatus(ip: string): Promise<ServerStatus> {
        return new Promise((resolve, reject) => {
            Gamedig.query({
                type: "garrysmod",
                host: ip
            }).then((state) => {
                resolve({
                    name: state.name,
                    map: state.map,
                    players: state.players.length,
                    maxPlayers: state.maxplayers,
                    game: state.raw["game"] || "Unknown",
                    online: true
                })
            }).catch((error) => {
                reject(error)
            })
        })
    }

    private async updateServerMessage(server: ServerInfo, status: ServerStatus | null) {
        try {
            const channel = await this.client.channels.fetch("1432049081047584890") as TextChannel
            if (!channel) return

            const message = await channel.messages.fetch(server.message)
            if (!message) return

            const embed = this.createStatusEmbed(server, status)
            const components = this.createComponents(server)

            await message.edit({ content: "", embeds: [embed], components: [components] })
        } catch (error) {
            console.error(`Ошибка при обновлении сообщения сервера ${server.name}:`, error)
        }
    }

    private createStatusEmbed(server: ServerInfo, status: ServerStatus | null): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle(`${server.icon} ${server.description}`)
            .setColor([47, 49, 54])
            .setTimestamp()

        if (status && status.online) {
            embed.setDescription(`**Статус сервера ${server.name}**`)
                .addFields(
                    { name: "<:globe:1433519536644034713> IP сервера", value: `\`${server.ip}\``, inline: true },
                    { name: "<:player:1433519563945021480> Игроки", value: `\`${status.players}/${status.maxPlayers}\``, inline: true },
                    { name: "<:map:1433519549961080872> Карта", value: `\`${status.map}\``, inline: true }
                )
        } else {
            embed.setDescription(`**Статус сервера ${server.name}**`)
                .addFields(
                    { name: "<:globe:1433519536644034713> IP сервера", value: `\`${server.ip}\``, inline: true },
                    { name: "🔴 Статус", value: "Сервер недоступен", inline: true }
                )
                .setColor([255, 0, 0])
        }

        return embed
    }

    private createComponents(server: ServerInfo): ActionRowBuilder<ButtonBuilder> {
        const connectUrl = `http://srv.asterion.games/steam/connect/${server.address}`
        
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("🔗 Подключиться")
                    .setURL(connectUrl)
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setCustomId(`server.players/${server.ip}`)
                    .setLabel("👥 Список игроков")
                    .setStyle(ButtonStyle.Secondary)
            )
    }
}