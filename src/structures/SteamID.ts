import { ActionRowBuilder, ButtonInteraction, CommandInteraction, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js"
import SteamID from "steamid"
import { GetData } from "./Data"
import hook = require("./Hook")
import axios from 'axios'

export function SteamIDTo64(steamID : string) : string {
    let steamID64 = "0"
        try {
        const sid = new SteamID(steamID)
        steamID64 = sid.getSteamID64()
    } catch (err) {}

    return steamID64
}

export function FindSteamID(userID : string) : string | undefined {
    const data = GetData("users_steamid", {})

    const userSteamID = data[userID]
    return userSteamID
}

export function EditSteamID(interaction : ButtonInteraction | CommandInteraction, userID : string, callback : Function) : void {
    const userSteamID = FindSteamID(userID) || ""

    const modal = new ModalBuilder()
        .setCustomId("user.steamid.set")
        .setTitle("Привязать SteamID")
    
    const steamidInput = new TextInputBuilder()
        .setCustomId("steamID")
        .setLabel("Ваш SteamID")
        .setPlaceholder("STEAM_0:0:000000000")
        .setMinLength(13)
        .setMaxLength(20)
        .setStyle(TextInputStyle.Short)

    if (userSteamID) {
        steamidInput.setValue(userSteamID)
    }

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(steamidInput),
    )
    
    interaction.showModal(modal)
    hook.Add("OnEditableSteamID", userID, (interaction : ModalSubmitInteraction, steamID : string) => {
        if (userID != interaction.user.id) return

        hook.Remove("OnEditableSteamID", userID)
        callback(interaction, steamID)
    })
}

export function GetSteamID(interaction : ButtonInteraction | CommandInteraction, userID : string, callback : Function) : void {
    const userSteamID = FindSteamID(userID)
    if (!userSteamID) {
        EditSteamID(interaction, userID, callback)
    } else {
        callback(interaction, userSteamID)
    }
}

export class SteamIDConverter {
    private static readonly STEAMID_REGEX = /^https?:\/\/steamcommunity\.com\/(profiles|id)\/([^\/]+)\/?$/i
    private static readonly STEAMID64_REGEX = /^[0-9]{17}$/
    private static readonly STEAM_API_KEY = process.env.STEAM_API_KEY
    private static readonly STEAM_API_URL = 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/'

    public static async convertUrlToSteamID(url: string): Promise<string | null> {
        if (!url) return null

        try {
            const match = url.match(this.STEAMID_REGEX)
            if (!match) return null

            const type = match[1].toLowerCase()
            const identifier = match[2]

            if (type === "profiles") {
                if (this.STEAMID64_REGEX.test(identifier)) {
                    return this.fromSteamID64(identifier)
                }
                return null
            } else if (type === "id") {
                const steamId64 = await this.resolveVanityUrl(identifier)
                return steamId64 ? this.fromSteamID64(steamId64) : null
            }

            return null
        } catch (error) {
            console.error('SteamID convert error:', error)
            return null
        }
    }

    public static toSteamID64(steamId: string): string {
        if (this.STEAMID64_REGEX.test(steamId)) {
            return steamId
        }

        const parts = steamId.match(/^STEAM_([0-9]+):([0-9]+):([0-9]+)$/i)
        if (!parts) throw new Error('Invalid SteamID format')

        const universe = BigInt(parts[1])
        const y = BigInt(parts[2])
        const z = BigInt(parts[3])
        
        return (z * 2n + y + 76561197960265728n).toString()
    }

    public static fromSteamID64(steamId64: string): string {
        if (!this.STEAMID64_REGEX.test(steamId64)) {
            throw new Error('Invalid SteamID64 format')
        }

        const id64 = BigInt(steamId64)
        const accountId = id64 & 0xFFFFFFFFn
        
        const y = accountId & 1n
        const z = accountId >> 1n
        
        return `STEAM_0:${y}:${z}`
    }

    private static async resolveVanityUrl(vanityUrl: string): Promise<string | null> {
        if (!this.STEAM_API_KEY) {
            throw new Error('Steam Web API key not configured')
        }

        try {
            const response = await axios.get(this.STEAM_API_URL, {
                params: {
                    key: this.STEAM_API_KEY,
                    vanityurl: vanityUrl
                }
            })

            if (response.data?.response?.success === 1) {
                return response.data.response.steamid
            } else if (response.data?.response?.success === 42) {
                return null
            } else {
                console.error('Steam API error:', response.data)
                return null
            }
        } catch (error) {
            console.error('Steam API request failed:', error)
            return null
        }
    }

    public static isValidSteamID(steamId: string): boolean {
        return this.STEAMID64_REGEX.test(steamId) || 
               /^STEAM_[0-9]+:[0-9]+:[0-9]+$/i.test(steamId)
    }
}