// buttons/Game.Rating.Start.ts
import { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } from "discord.js"
import { Button } from "../types"
import { FindCharacterByID } from "../structures/GameCharacters"
import { GameComponent, UserComponent } from "../structures/Game"
import { GetData } from "../structures/Data"

interface ProfileSettings {
    hide_profile?: boolean
    rating?: {
        likes: string[]
    }
}

interface ProfilesData {
    [userID: string]: ProfileSettings
}

const ITEMS_PER_PAGE = 25

export async function showRatingPage(interaction: ButtonInteraction, game: GameComponent, otherUsers: UserComponent[], page: number) {
    const currentPage = page
    const totalPages = Math.ceil(otherUsers.length / ITEMS_PER_PAGE)
    const startIndex = currentPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const usersOnPage = otherUsers.slice(startIndex, endIndex)

    const options = usersOnPage.map((user) => {
        const cleanTag = user.tag.replace(/#0$/, '')
        let characterName = "Персонаж не выбран"
        let characterEmoji = "❓"
        
        if (user.id === game.gamemaster.id) {
            characterName = "Гейммастер"
            characterEmoji = "👑"
        } else if (game.admins.has(user.id)) {
            characterName = "Администратор"
            characterEmoji = "🛡️"
        }
        
        if (user.character) {
            const character = FindCharacterByID(user.character, game)
            if (character) {
                characterName = character.name
                characterEmoji = character.emoji || "❓"
            }
        }
        
        const userStatus = user.status === 2 ? "Одобрен" : "Запас"
        
        return {
            label: cleanTag.length > 100 ? cleanTag.substring(0, 97) + '...' : cleanTag,
            description: `${characterName} | Статус: ${userStatus}`,
            value: user.id,
            emoji: characterEmoji
        }
    })

    const embed = new EmbedBuilder()
        .setTitle(`<:Activity:1441500857869795470> Оценка игроков: ${game.title}`)
        .setDescription("Выберите игроков, гейммастера или администраторов, которых хотите оценить за участие в игре. Им будут автоматически поставлены лайки.\n\n**Можно выбрать несколько пользователей!**")
        .setColor([47, 49, 54])
        .setFooter({ text: `Страница ${currentPage + 1} из ${totalPages}` })

    const rows: (ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>)[] = []

    if (options.length > 0) {
        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`game.rating.players/${game.game_id}`)
                    .setPlaceholder("Выберите пользователей для оценки...")
                    .setMinValues(1)
                    .setMaxValues(options.length)
                    .addOptions(options)
            )
        rows.push(row1)
    } else {
        embed.setDescription("Все пользователи этой игры уже были вами оценены!")
    }

    if (totalPages > 1) {
        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`game.rating.page/${game.game_id}/${currentPage - 1}`)
                    .setLabel("Предыдущая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage <= 0),
                new ButtonBuilder()
                    .setCustomId(`game.rating.page/${game.game_id}/${currentPage + 1}`)
                    .setLabel("Следующая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage >= totalPages - 1)
            )
        rows.push(row2)
    }

    await interaction.editReply({ embeds: [embed], components: rows })
}

const button : Button = {
    customId: "game.rating.start",
    execute: async (interaction, gameID) => {
        const currentUserID = interaction.user.id
        
        let game: GameComponent | null = null
        interaction.client.games.forEach(g => {
            if (g.game_id === gameID) {
                game = g
            }
        })

        if (!game) {
            await interaction.reply({ 
                content: "Игра не найдена.",
                ephemeral: true
            })
            return
        }

        const profilesData: ProfilesData = GetData("profiles", {})
        
        const usersILiked = new Set<string>()
        for (const [targetUserID, settings] of Object.entries(profilesData)) {
            if (settings.rating?.likes?.includes(currentUserID)) {
                usersILiked.add(targetUserID)
            }
        }

        const otherUsers: UserComponent[] = []
        
        if (game.gamemaster.id !== currentUserID && !usersILiked.has(game.gamemaster.id)) {
            otherUsers.push({
                ...game.gamemaster,
                status: 2,
                character: null,
                characters: [],
                time: "",
                avatarURL: game.gamemaster.avatarURL || ""
            })
        }

        game.admins.forEach(admin => {
            if (admin.id !== currentUserID && !usersILiked.has(admin.id)) {
                otherUsers.push({
                    ...admin,
                    status: 2,
                    character: null,
                    characters: [],
                    time: "",
                    avatarURL: admin.avatarURL || ""
                })
            }
        })

        game.users.forEach((user: UserComponent) => {
            if (user.id !== currentUserID && 
                (user.status === 2 || user.status === 3) && 
                !usersILiked.has(user.id)) {
                otherUsers.push(user)
            }
        })

        if (otherUsers.length === 0) {
            await interaction.reply({ 
                content: "Все пользователи этой игры уже были вами оценены!", 
                ephemeral: true 
            })
            return
        }

        await interaction.deferReply({ephemeral: true})
        await showRatingPage(interaction, game, otherUsers, 0)
    }
}

export default button