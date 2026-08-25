import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { SelectMenu } from "../types"
import { GameDataManager } from "../structures/GameDataManager"
import { FindCharacterByID } from "../structures/GameCharacters"
import { getCharacterImagePath } from "../buttons/Navigation.Profile"

const selectMenu : SelectMenu = {
    customId: "navigation.profile.played.select",
    execute: async (interaction, profileID) => {
        await interaction.deferUpdate()
        
        const gameID = interaction.values[0]
        const userID = interaction.user.id
        const targetUserID = profileID as string || userID
        const game = GameDataManager.getGame(gameID)

        if (!game) {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Ошибка")
                        .setDescription("Информация об игре не найдена.")
                        .setColor([255, 0, 0])
                ]
            })
            return
        }

        const embed = GameDataManager.generateGameInfoContent(game, targetUserID)

        let characterImagePath: string | null = null
        if (game.users && game.users[targetUserID]) {
            const userInGame = game.users[targetUserID]
            if (userInGame.character) {
                const character = FindCharacterByID(userInGame.character)

                if (character) {
                    characterImagePath = getCharacterImagePath(character.uniqueID)

                    if (characterImagePath) {
                        embed.setImage(`attachment://${characterImagePath.split('/').pop()}`)
                    }
                }
            }
        }

        const row1 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.played.players/${targetUserID}/${gameID}`)
                    .setLabel("Просмотр игроков")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(!game.users || Object.keys(game.users).length === 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile/${targetUserID}`)
                    .setLabel("Вернуться к профилю")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.played/${targetUserID}`)
                    .setLabel("Назад к списку сыгранных игр")
                    .setStyle(ButtonStyle.Primary)
            )
        
        const files = characterImagePath ? [characterImagePath] : []

        await interaction.editReply({ content: "", embeds: [embed], components: [row1], files: files })
    }
}

export default selectMenu