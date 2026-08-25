import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from "discord.js"
import { Button } from "../types"
import { GameDataManager } from "../structures/GameDataManager"

const button : Button = {
    customId: "navigation.profile.invited.player.games",
    execute: async (interaction, playerID, page = "0") => {
        await interaction.deferUpdate()
        
        const currentPage = parseInt(page as string)
        const playerGames = GameDataManager.getUserGames(playerID as string)
        let allGames = [...playerGames.played, ...playerGames.upcoming]
        
        allGames = GameDataManager.sortGamesByIdDesc(allGames)
        
        const totalPages = GameDataManager.getTotalPages(allGames.length)
        const gamesOnPage = GameDataManager.getPaginatedItems(allGames, currentPage)

        if (allGames.length === 0) {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Игры игрока")
                        .setDescription("У этого игрока нет истории игр.")
                        .setColor([47, 49, 54])
                ]
            })
            return
        }

        const options = gamesOnPage.map((game, index) => ({
            label: game.title.length > 100 ? game.title.substring(0, 97) + '...' : game.title,
            description: `ID: ${game.game_id}`,
            value: game.game_id
        }))

        const embed = new EmbedBuilder()
            .setTitle("Игры игрока")
            .setDescription(`Выберите игру для просмотра информации.\n\nСтраница: **${currentPage + 1} из ${totalPages}**`)
            .setColor([47, 49, 54])

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`navigation.profile.played.select/${playerID}`)
                    .setPlaceholder("Выберите игру...")
                    .addOptions(options)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.invited.player.games/${playerID}/${currentPage - 1}`)
                    .setLabel("Предыдущая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage <= 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.invited.player.games/${playerID}/${currentPage + 1}`)
                    .setLabel("Следующая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage >= totalPages - 1),
                new ButtonBuilder()
                    .setCustomId("navigation.profile.invited")
                    .setLabel("Назад к списку приглашенных пользователей")
                    .setStyle(ButtonStyle.Primary)
            )

        await interaction.editReply({ content: "", embeds: [embed], components: [row1, row2], files: [] })
    }
}

export default button