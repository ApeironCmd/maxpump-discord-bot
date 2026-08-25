import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js"
import { Button } from "../types"
import { GetData, SetData } from "../structures/Data"

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
    customId: "navigation.profile.settings",
    execute: async (interaction) => {
        if (!interaction.replied && !interaction.deferred) {
            await interaction.deferUpdate()
        }
        
        const userID = interaction.user.id
        const profilesData: ProfilesData = GetData("profiles", {})
        const userSettings = profilesData[userID] || {}
        
        const isProfileHidden = userSettings.hide_profile || false

        const embed = new EmbedBuilder()
            .setTitle(`Настройки профиля ${interaction.user.username}`)
            .setDescription("Настройте видимость вашего профиля для других пользователей.")
            .addFields(
                {
                    name: "Приватность профиля:",
                    value: isProfileHidden 
                        ? "Ваш профиль **скрыт** от других пользователей." 
                        : "Ваш профиль **открыт** для просмотра другими пользователями.",
                    inline: false
                }
            )
            .setColor([47, 49, 54])

        const row1 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`navigation.profile.settings.toggle/${!isProfileHidden}`)
                    .setLabel(isProfileHidden ? "Открыть профиль" : "Скрыть профиль")
                    .setStyle(isProfileHidden ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("navigation.profile")
                    .setLabel("Назад к профилю")
                    .setStyle(ButtonStyle.Primary)
            )

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: "", embeds: [embed], components: [row1], files: [] })
        } else {
            await interaction.update({ content: "", embeds: [embed], components: [row1], files: [] })
        }
    }
}

export default button 