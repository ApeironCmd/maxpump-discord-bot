import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from "discord.js"
import { Button } from "../types"
import { GetData } from "../structures/Data"
import { UserCacheHelper } from "../structures/UserCacheHelper"

interface ProfileSettings {
    hide_profile?: boolean
    rating?: {
        likes: string[]
    }
}

interface ProfilesData {
    [userID: string]: ProfileSettings
}

const button : Button = {
    customId: "navigation.profile.likes.list",
    execute: async (interaction, profileID, page = "0") => {
        await interaction.deferUpdate()
        
        const userID = interaction.user.id
        const targetUserID = profileID as string
        const currentPage = parseInt(page as string)
        const ITEMS_PER_PAGE = 25
        
        const profilesData: ProfilesData = GetData("profiles", {})
        const targetProfileSettings = profilesData[targetUserID] || {}
        const likes = targetProfileSettings.rating?.likes || []

        if (likes.length === 0) {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Список лайкнувших")
                        .setDescription("Нет пользователей, которые поставили лайк.")
                        .setColor([47, 49, 54])
                ]
            })
            return
        }

        const totalPages = Math.ceil(likes.length / ITEMS_PER_PAGE)
        const startIndex = currentPage * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const likesOnPage = likes.slice(startIndex, endIndex)

        const options = []
        for (const likeUserID of likesOnPage) {
            try {
                const user = await UserCacheHelper.getUser(interaction.client, likeUserID)
                options.push({
                    label: user.username,
                    description: `ID: ${user.id}`,
                    value: user.id
                })
            } catch (error) {
                options.push({
                    label: "Неизвестный пользователь",
                    description: `ID: ${likeUserID}`,
                    value: likeUserID
                })
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("Список лайкнувших")
            .setDescription(`Выберите пользователя для просмотра его профиля.\n\nСтраница: **${currentPage + 1} из ${totalPages}**`)
            .setColor([47, 49, 54])

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`navigation.profile.likes.list.select/${targetUserID}`)
                    .setPlaceholder("Выберите пользователя...")
                    .addOptions(options)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.likes.list/${targetUserID}/${currentPage - 1}`)
                    .setLabel("Предыдущая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage <= 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.likes.list/${targetUserID}/${currentPage + 1}`)
                    .setLabel("Следующая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage >= totalPages - 1),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.likes/${targetUserID}`)
                    .setLabel("Назад к лайкам")
                    .setStyle(ButtonStyle.Primary)
            )

        await interaction.editReply({ content: "", embeds: [embed], components: [row1, row2], files: [] })
    }
}

export default button