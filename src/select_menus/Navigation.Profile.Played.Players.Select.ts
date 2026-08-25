import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { SelectMenu } from "../types"
import { GameDataManager } from "../structures/GameDataManager"
import { FindCharacterByID } from "../structures/GameCharacters"
import { getCharacterImagePath } from "../buttons/Navigation.Profile"

const selectMenu : SelectMenu = {
    customId: "navigation.profile.played.players.select",
    execute: async (interaction, profileID, gameID) => {
        await interaction.deferUpdate()
        
        const playerID = interaction.values[0]
        const userID = interaction.user.id
        const targetUserID = playerID
        const game = GameDataManager.getGame(gameID as string)

        if (!game || !game.users) {
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

        const player = game.users[playerID]
        if (!player) {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Ошибка")
                        .setDescription("Информация об игроке не найдена.")
                        .setColor([255, 0, 0])
                ]
            })
            return
        }

        const embed = (await GameDataManager.generatePlayerInfoContent(player, game.title, interaction))

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

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                // new ButtonBuilder()
                //     .setCustomId(`navigation.profile.player.games/${playerID}`)
                //     .setLabel("Сыгранные игры")
                //     .setStyle(ButtonStyle.Secondary),
                // new ButtonBuilder()
                //     .setCustomId(`navigation.profile.gamemaster/${playerID}`)
                //     .setLabel("Проводимые игры")
                //     .setStyle(ButtonStyle.Secondary)
                //     .setDisabled(gamemasterGamesCount === 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile/${playerID}`)
                    .setLabel("Игровой профиль")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.played.select/${playerID}/${gameID}`)
                    .setLabel("Информация об игре")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.played.players/${targetUserID}/${gameID}`)
                    .setLabel("Назад к списку игроков")
                    .setStyle(ButtonStyle.Primary)
            )

        const files = characterImagePath ? [characterImagePath] : []

        await interaction.editReply({ content: "", embeds: [embed], components: [row], files: files })
    }
}

export default selectMenu