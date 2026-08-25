import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { Button } from "../types"
import { GetData } from "../structures/Data"
import { GameDataManager } from "../structures/GameDataManager"
import { FindCharacterByID } from "../structures/GameCharacters"
import { getCharacterImagePath } from "./Navigation.Profile"

const button : Button = {
    customId: "navigation.profile.played.back",
    execute: async (interaction, gameID) => {
        await interaction.deferUpdate()
        
        const userID = interaction.user.id
        const targetUserID = userID
        const gamesArchive: { [key: string]: any } = GetData("games_archive", {})
        const game = gamesArchive[gameID as string]

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

        const embed = GameDataManager.generateGameInfoContent(game, userID)

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
                    .setCustomId(`navigation.profile.played.players/${gameID}`)
                    .setLabel("Просмотр игроков")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(!game.users || Object.keys(game.users).length === 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile`)
                    .setLabel("Вернуться к профилю")
                    .setStyle(ButtonStyle.Secondary),
                // new ButtonBuilder()
                //     .setCustomId("navigation.profile.played")
                //     .setLabel("Назад к списку игр")
                //     .setStyle(ButtonStyle.Primary)
            )

        const files = characterImagePath ? [characterImagePath] : []

        await interaction.editReply({ content: "", embeds: [embed], components: [row1], files: files })
    }
}

export default button