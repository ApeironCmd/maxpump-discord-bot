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
    customId: "navigation.profile.likes.given",
    execute: async (interaction, profileID, page = "0") => {
        await interaction.deferUpdate()
        
        const userID = interaction.user.id
        const currentPage = parseInt(page as string)
        const ITEMS_PER_PAGE = 25
        
        const profilesData: ProfilesData = GetData("profiles", {})
        
        const likedUsers = []
        for (const [targetUserID, settings] of Object.entries(profilesData)) {
            if (targetUserID !== userID && settings.rating?.likes?.includes(userID)) {
                likedUsers.push(targetUserID)
            }
        }

        if (likedUsers.length === 0) {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Мои лайки")
                        .setDescription("Вы еще никому не поставили лайк.")
                        .setColor([47, 49, 54])
                ]
            })
            return
        }

        const totalPages = Math.ceil(likedUsers.length / ITEMS_PER_PAGE)
        const startIndex = currentPage * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const usersOnPage = likedUsers.slice(startIndex, endIndex)

        const users = await UserCacheHelper.getUsers(interaction.client, usersOnPage)

        const options = []
        for (const likedUserID of usersOnPage) {
            const user = users.get(likedUserID)
            if (user) {
                options.push({
                    label: user.username,
                    description: `ID: ${user.id}`,
                    value: user.id
                })
            } else {
                options.push({
                    label: "Неизвестный пользователь",
                    description: `ID: ${likedUserID}`,
                    value: likedUserID
                })
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("Мои лайки")
            .setDescription(`Пользователи, которым вы поставили лайк.\n\nСтраница: **${currentPage + 1} из ${totalPages}**`)
            .setColor([47, 49, 54])

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`navigation.profile.likes.given.select`)
                    .setPlaceholder("Выберите пользователя...")
                    .addOptions(options)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.likes.given/${userID}/${currentPage - 1}`)
                    .setLabel("Предыдущая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage <= 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.likes.given/${userID}/${currentPage + 1}`)
                    .setLabel("Следующая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage >= totalPages - 1),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.likes/${userID}`)
                    .setLabel("Назад к лайкам")
                    .setStyle(ButtonStyle.Primary)
            )

        await interaction.editReply({ content: "", embeds: [embed], components: [row1, row2], files: [] })
    }
}

export default button