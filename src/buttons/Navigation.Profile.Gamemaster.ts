import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from "discord.js"
import { Button } from "../types"
import { GameDataManager, GameUser } from "../structures/GameDataManager"
import { FindCharacterByID } from "../structures/GameCharacters"
import { UserCacheHelper } from "../structures/UserCacheHelper"

const ITEMS_PER_PAGE = 25

const button : Button = {
    customId: "navigation.profile.gamemaster",
    execute: async (interaction, profileID, page = "0") => {
        await interaction.deferUpdate()
        
        const userID = interaction.user.id
        const targetUserID = profileID as string || userID
        const target = await UserCacheHelper.getUser(interaction.client, targetUserID)
        const isOwnProfile = targetUserID === userID
        const currentPage = parseInt(page as string)

        let gamemasterGames = GameDataManager.getUserGamemasterGames(targetUserID)
        
        gamemasterGames = GameDataManager.sortGamesByIdDesc(gamemasterGames)

        if (gamemasterGames.length === 0) {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`<:Game:1305168542123036774> Проведенные игры ${target.username}`)
                        .setDescription(`${isOwnProfile ? "У вас" : "У этого игрока"} нет истории проведенных игр.`)
                        .setColor([47, 49, 54])
                ]
            })
            return
        }

        const totalPages = Math.ceil(gamemasterGames.length / ITEMS_PER_PAGE)
        const startIndex = currentPage * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const gamesOnPage = gamemasterGames.slice(startIndex, endIndex)

        const options = gamesOnPage.map((game, index) => {
            const userInGame = game.users ? Object.values(game.users as { [key: string]: GameUser }).find(u => u.id === targetUserID) : null
            let characterName = "🎮 Гейммастер"
            let characterEmoji = "🎮"
            let userStatus = "🎮 Гейммастер"
            const gameType = game.private ? "🔒 Приватная" : "🌐 Официальная"
            
            userStatus = "🎮 Гейммастер"
            
            if (userInGame && userInGame.character) {
                const character = FindCharacterByID(userInGame.character, game)
                if (character) {
                    characterName = character.name
                    characterEmoji = character.emoji || "🎮"
                }
            }
            
            return {
                label: gameType + ": " + (game.title.length > 100 ? game.title.substring(0, 97) + '...' : game.title),
                description: `${characterName} | Статус: ${userStatus}`,
                value: game.game_id,
                emoji: characterEmoji
            }
        })

        const embed = new EmbedBuilder()
            .setTitle(`<:Game:1305168542123036774> Проведенные игры ${target.username}`)
            .setDescription(`Выберите игру из списка для просмотра подробной информации.\n\nСтраница: **${currentPage + 1} из ${totalPages}**`)
            .setColor([47, 49, 54])

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`navigation.profile.gamemaster.select/${targetUserID}`)
                    .setPlaceholder("Выберите игру...")
                    .addOptions(options)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.gamemaster/${targetUserID}/${currentPage - 1}`)
                    .setLabel("Предыдущая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage <= 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.gamemaster/${targetUserID}/${currentPage + 1}`)
                    .setLabel("Следующая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage >= totalPages - 1),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile/${targetUserID}`)
                    .setLabel("Назад к профилю")
                    .setStyle(ButtonStyle.Primary)
            )

        await interaction.editReply({ content: "", embeds: [embed], components: [row1, row2], files: [] })
    }
}

export default button