import { SubCommand } from "../types"
import { SteamIDConverter } from "../structures/SteamID"

const command: SubCommand = {
    id: "steamid.convert",
    execute: async (interaction) => {
        let input: string = String(interaction.options.get("input").value).trim()

        try {
            await interaction.deferReply({ ephemeral: true })

            if (!/^https?:\/\//i.test(input) && 
                !/^\d{17}$/.test(input) && 
                !/^STEAM_[0-9]+:[0-9]+:[0-9]+$/i.test(input)) {
                input = `https://steamcommunity.com/id/${input}`
            }

            let steamId: string | null = null
            let steamId64: string | null = null

            if (/^\d{17}$/.test(input)) {
                steamId64 = input
                steamId = SteamIDConverter.fromSteamID64(input)
            } 
            else if (/^STEAM_[0-9]+:[0-9]+:[0-9]+$/i.test(input)) {
                steamId = input
                steamId64 = SteamIDConverter.toSteamID64(input)
            } 
            else {
                steamId = await SteamIDConverter.convertUrlToSteamID(input)
                if (steamId) {
                    steamId64 = SteamIDConverter.toSteamID64(steamId)
                }
            }

            if (steamId && steamId64) {
                const responseContent = [
                    `**Входные данные:** \`${interaction.options.get("input").value}\``,
                    `**Использованный URL:** \`${input}\``,
                    `**SteamID:** \`${steamId}\``,
                    `**SteamID64:** \`${steamId64}\``,
                    `**Профиль:** [перейти](https://steamcommunity.com/profiles/${steamId64})`,
                    `\nВы можете использовать этот SteamID для привязки к аккаунту.`
                ].join('\n')

                await interaction.editReply({
                    content: responseContent
                })
            } else {
                await interaction.editReply({
                    content: "❌ Не удалось распознать ввод. Поддерживаются:\n" +
                            "1. Имя профиля (selenter)\n" +
                            "2. Ссылка на профиль (https://steamcommunity.com/id/selenter)\n" +
                            "3. SteamID64 (76561198215319195)\n" +
                            "4. SteamID (STEAM_0:1:127526733)"
                })
            }
        } catch (error) {
            console.error("SteamID convert error:", error)
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    content: "⚠ Произошла ошибка при конвертации. Попробуйте позже."
                })
            } else {
                await interaction.reply({
                    content: "⚠ Произошла ошибка при конвертации. Попробуйте позже.",
                    ephemeral: true
                })
            }
        }
    }
}

export default command