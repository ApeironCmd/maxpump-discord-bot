import { TextChannel, PermissionFlagsBits } from "discord.js"
import { FindControlChannelByID, FindGameByControlChannelID } from "../structures/Game"
import { FindSteamID } from "../structures/SteamID"
import { Modal } from "../types"

const modal : Modal = {
    customId: "control.game.permissions.adminadd",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const userIDInput = interaction.fields.getTextInputValue("userIDInput")

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.gamemaster.id != userID) return interaction.reply({content: "Вы не являетесь Гейммастером данной игры!", ephemeral: true})

        if (game.gamemaster.id == userIDInput) return interaction.reply({content: "Вы являетесь Гейммастером данной игры!", ephemeral: true})

        if (game.admins.get(userIDInput)) return interaction.reply({content: "Данный пользователь уже является администратором!", ephemeral: true})

        const steamID = FindSteamID(userIDInput)
        if (!steamID) return interaction.reply({content: "У данного человека не привязан SteamID!", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        const member = await interaction.guild.members.fetch(userIDInput).catch((error) => {
            interaction.editReply({content: "Упс... что-то пошло не так. (user is undefined)"})
        })
        if (!member) return

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {})
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        game.admins.set(member.user.id, {
            tag: member.user.tag,
            id: member.user.id,
            steam_id: steamID,
            avatarURL: member.avatarURL()
        })
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
        await interaction.editReply({content: "Вы успешно выдали права администратора пользователю!"})
    }
}

export default modal