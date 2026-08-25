import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { Button } from "../types"
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

function getLikesDescription(receivedLikes: string[], givenLikesCount: number, isOwnProfile: boolean): string {
    let description = ""
    
    if (receivedLikes.length > 0) {
        description += `Получено лайков: **${receivedLikes.length}**\n`
    } else {
        description += `${isOwnProfile ? "Вам пока никто не поставил лайк" : "Этому пользователю пока никто не поставил лайк"}.\n`
    }
    
    if (isOwnProfile && givenLikesCount > 0) {
        description += `Вы поставили лайков: **${givenLikesCount}**`
    } else if (isOwnProfile && givenLikesCount === 0) {
        description += `Вы никому не поставили лайк.`
    }
    
    return description
}

const button : Button = {
    customId: "navigation.profile.likes",
    execute: async (interaction, profileID) => {
        await interaction.deferUpdate()
        
        const userID = interaction.user.id
        const targetUserID = profileID as string || userID
        const isOwnProfile = targetUserID === userID
        
        const profilesData: ProfilesData = GetData("profiles", {})
        const targetProfileSettings = profilesData[targetUserID] || {}
        
        const receivedLikes = targetProfileSettings.rating?.likes || []
        
        let givenLikesCount = 0
        if (isOwnProfile) {
            for (const [otherUserID, settings] of Object.entries(profilesData)) {
                if (otherUserID !== userID && settings.rating?.likes?.includes(userID)) {
                    givenLikesCount++
                }
            }
        }

        if (receivedLikes.length === 0 && givenLikesCount === 0 && isOwnProfile) {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Лайки")
                        .setDescription(getLikesDescription(receivedLikes, givenLikesCount, isOwnProfile))
                        .setColor([47, 49, 54])
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`navigation.profile/${targetUserID}`)
                            .setLabel("Назад к профилю")
                            .setStyle(ButtonStyle.Primary)
                    )
                ]
            })
            return
        }

        if (receivedLikes.length === 0 && givenLikesCount > 0 && isOwnProfile) {
            const embed = new EmbedBuilder()
                .setTitle("Лайки")
                .setDescription(getLikesDescription(receivedLikes, givenLikesCount, isOwnProfile))
                .setColor([47, 49, 54])

            const row1 = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`navigation.profile.likes.given/${targetUserID}`)
                        .setLabel("Посмотреть мои лайки")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`navigation.profile/${targetUserID}`)
                        .setLabel("Назад к профилю")
                        .setStyle(ButtonStyle.Primary)
                )

            await interaction.editReply({ content: "", embeds: [embed], components: [row1], files: [] })
            return
        }

        const embed = new EmbedBuilder()
            .setTitle("Лайки")
            .setDescription(getLikesDescription(receivedLikes, givenLikesCount, isOwnProfile))
            .setColor([47, 49, 54])

        const row1 = new ActionRowBuilder<ButtonBuilder>()

        if (receivedLikes.length > 0) {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.likes.list/${targetUserID}`)
                    .setLabel("Просмотреть список лайкнувших")
                    .setStyle(ButtonStyle.Success)
            )
        }

        if (isOwnProfile && givenLikesCount > 0) {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.likes.given/${targetUserID}`)
                    .setLabel("Посмотреть мои лайки")
                    .setStyle(ButtonStyle.Success)
            )
        }

        row1.addComponents(
            new ButtonBuilder()
                .setCustomId(`navigation.profile/${targetUserID}`)
                .setLabel("Назад к профилю")
                .setStyle(ButtonStyle.Primary)
        )

        await interaction.editReply({ content: "", embeds: [embed], components: [row1], files: [] })
    }
}

export default button