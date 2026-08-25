import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from "discord.js"
import { Button } from "../types"
import { UserProfile, InvitedUser } from "../structures/UserProfile"
import { UserCacheHelper } from "../structures/UserCacheHelper"

const ITEMS_PER_PAGE = 25

const button : Button = {
    customId: "navigation.profile.invited",
    execute: async (interaction, profileID, page = "0") => {
        await interaction.deferUpdate()
        
        const userID = interaction.user.id
        const targetUserID = profileID as string || userID
        const target = await UserCacheHelper.getUser(interaction.client, targetUserID)
        const currentPage = parseInt(page as string)

        const profile = UserProfile.getFullProfile(targetUserID)
        const invitedUsers = profile.invitedUsers as InvitedUser[]

        if (!invitedUsers || invitedUsers.length === 0) {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`<:Latter:1305124712170389524> Приглашенные пользователи ${target.username}`)
                        .setDescription("У вас нет приглашенных пользователей.")
                        .setColor([47, 49, 54])
                ]
            })
            return
        }

        const totalPages = Math.ceil(invitedUsers.length / ITEMS_PER_PAGE)

        const startIndex = currentPage * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const usersOnPage = invitedUsers.slice(startIndex, endIndex)

        if (usersOnPage.length === 0) {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`<:Latter:1305124712170389524> Приглашенные пользователи ${target.username}`)
                        .setDescription("На этой странице нет приглашенных пользователей.")
                        .setColor([47, 49, 54])
                ]
            })
            return
        }

        const options = usersOnPage.map((user, index) => {
            const cleanName = user.name.replace(/#0$/, '')
            return {
                label: cleanName.length > 100 ? cleanName.substring(0, 97) + '...' : cleanName,
                description: `ID: ${user.id}`,
                value: user.id
            }
        })

        const embed = new EmbedBuilder()
            .setTitle(`<:Latter:1305124712170389524> Приглашенные пользователи ${target.username}`)
            .setDescription(`Выберите пользователя из списка для просмотра подробной информации.\n\nСтраница: **${currentPage + 1} из ${totalPages}**`)
            .setColor([47, 49, 54])

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`navigation.profile.invited.select/${targetUserID}`)
                    .setPlaceholder("Выберите пользователя...")
                    .addOptions(options)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.invited.page/${targetUserID}/${currentPage - 1}`)
                    .setLabel("Предыдущая")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage <= 0),
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.invited.page/${targetUserID}/${currentPage + 1}`)
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