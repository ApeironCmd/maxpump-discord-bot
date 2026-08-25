import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from "discord.js"
import { Button } from "../types"
import { GameDataManager } from "../structures/GameDataManager"
import { FindCharacterByID } from "../structures/GameCharacters"

const button : Button = {
    customId: "navigation.profile.played.players",
    execute: async (interaction, profileID, gameID, page = "0") => {
        await interaction.deferUpdate()
        
        const userID = interaction.user.id
        const targetUserID = profileID as string || userID
        
        const currentPage = parseInt(page as string)
        const game : any = GameDataManager.getGame(gameID as string)

        if (!game || !game.users) {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Ошибка")
                        .setDescription("Информация об игре или игроках не найдена.")
                        .setColor([255, 0, 0])
                ]
            })
            return
        }

        const users = GameDataManager.getGameUsers(gameID as string)
        const totalPages = GameDataManager.getTotalPages(users.length)
        const usersOnPage = GameDataManager.getPaginatedItems(users, currentPage)

        if (usersOnPage.length === 0 && currentPage > 0) {
            return button.execute(interaction, profileID, gameID, "0")
        }

        const options = usersOnPage.map((user, index) => {
            const cleanTag = user.tag.replace(/#0$/, '')
            let characterName = `Персонаж не выбран`
            let characterEmoji = "❓"
            
            if (user.character) {
                const character = FindCharacterByID(user.character, game)
                if (character) {
                    characterName = character.name
                    characterEmoji = character.emoji || "❓"
                }
            }
            
            return {
                label: characterName.length > 100 ? characterName.substring(0, 97) + '...' : characterName,
                description: `Игрок: ${cleanTag} | Статус: ${GameDataManager.getStatusText(user.status)}`,
                value: user.id,
                emoji: characterEmoji
            }
        })

        const embed = new EmbedBuilder()
            .setTitle(`<:Game:1305168542123036774> Игроки игры ${game.title}`)
            .setDescription(`Выберите игрока для просмотра подробной информации.\n\n**Страница ${currentPage + 1} из ${totalPages}**`)
            .setColor([47, 49, 54])

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`navigation.profile.played.players.select/${targetUserID}/${gameID}`)
                    .setPlaceholder("Выберите игрока...")
                    .addOptions(options.length > 0 ? options : [{ label: "Нет игроков", value: "empty", description: "На этой странице нет игроков" }])
                    .setDisabled(options.length === 0)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.played.players/${targetUserID}/${gameID}/${currentPage - 1}`)
                    .setLabel("Предыдущая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage <= 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.played.players/${targetUserID}/${gameID}/${currentPage + 1}`)
                    .setLabel("Следующая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage >= totalPages - 1 || usersOnPage.length === 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.played.select/${targetUserID}/${gameID}`)
                    .setLabel("Назад к игре")
                    .setStyle(ButtonStyle.Primary)
            )

        await interaction.editReply({ content: "", embeds: [embed], components: [row1, row2], files: [] })
    }
}

export default button