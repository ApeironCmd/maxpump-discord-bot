import { EmbedBuilder } from "discord.js"
import { SelectMenu } from "../types"
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

const selectMenu : SelectMenu = {
    customId: "game.rating.players",
    execute: async (interaction, gameID) => {
        await interaction.deferUpdate()
        
        const selectedUserIDs = interaction.values
        const currentUserID = interaction.user.id
        
        let game = null
        interaction.client.games.forEach(g => {
            if (g.game_id === gameID) {
                game = g
            }
        })

        if (!game) {
            await interaction.editReply({ 
                content: "Игра не найдена.",
                components: []
            })
            return
        }

        const profilesData: ProfilesData = GetData("profiles", {})
        let likedCount = 0
        const alreadyLikedUsers = []
        const selfLikedUsers = []

        for (const userID of selectedUserIDs) {
            if (userID === currentUserID) {
                selfLikedUsers.push(userID)
                continue
            }
            
            if (!profilesData[userID]) {
                profilesData[userID] = {}
            }
            
            if (!profilesData[userID].rating) {
                profilesData[userID].rating = { likes: [] }
            }
            
            const likes = profilesData[userID].rating!.likes || []
            
            if (!likes.includes(currentUserID)) {
                profilesData[userID].rating!.likes.push(currentUserID)
                likedCount++
            } else {
                alreadyLikedUsers.push(userID)
            }
        }

        SetData("profiles", profilesData)

        let description = `Вы успешно оценили **${likedCount}** игроков из **${selectedUserIDs.length}** выбранных.\n\n`
        description += `Выбранные игроки были оценены.`
        
        if (alreadyLikedUsers.length > 0) {
            description += `\n\n**${alreadyLikedUsers.length}** игроков уже имели лайк от вас.`
        }
        
        if (selfLikedUsers.length > 0) {
            description += `\n\nВы не можете поставить лайк самому себе!`
        }

        const embed = new EmbedBuilder()
            .setTitle("<:Like:1441500885665714316> Оценка завершена")
            .setDescription(description)
            .setColor([0, 255, 0])
            .setFooter({ text: "Лайки были добавлены в профили игроков" })

        await interaction.editReply({ embeds: [embed], components: [] })
    }
}

export default selectMenu