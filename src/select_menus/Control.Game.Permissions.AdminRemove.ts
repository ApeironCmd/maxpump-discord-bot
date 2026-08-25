import { SelectMenu } from "../types"
import { PermissionFlagsBits } from "discord.js"
import { FindControlChannelByID, FindGameByControlChannelID } from "../structures/Game"
import { Vars } from "../structures/Data"

const selectMenu : SelectMenu = {
    customId: "control.game.permissions.adminremove",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.gamemaster.id != userID) return interaction.reply({content: "Вы не являетесь Гейммастером данной игры!", ephemeral: true})

        await interaction.deferUpdate()

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {})
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        for (const userID of interaction.values) {
            game.admins.delete(userID)
        }
        game.save()

        let asyncArray = [game.gamemaster.id]
        game.admins.forEach(admin => {
            asyncArray.push(admin.id)
        })

        let permissions : any[] = [
            {
                id: interaction.guild.roles.everyone,
                deny: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.ManageChannels
                ]
            }
        ]

        for (const userID of asyncArray) {
            const member = await interaction.guild.members.fetch(userID).catch((error) => {})
            if (member) {
                permissions.push({
                    id: member.user,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.ManageChannels
                    ]
                })
            }
        }

        await controlChannel.permissionOverwrites.set(permissions)
        await interaction.editReply({content: "Вы успешно сняли выбранных администраторов!", embeds: [], components: []})
    }
}

export default selectMenu