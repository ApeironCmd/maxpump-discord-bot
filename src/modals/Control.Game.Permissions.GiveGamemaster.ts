import { Message, PermissionFlagsBits } from "discord.js"
import { FindControlChannelByID, FindControlMessageByID, FindGameApplyForumByID, FindGameByControlChannelID, FindGameThreadByID, FindThreadMessageByID } from "../structures/Game"
import { FindSteamID } from "../structures/SteamID"
import { Modal } from "../types"
import { buildEmbeds } from "./Game.Create"

const modal : Modal = {
    customId: "control.game.permissions.givegamemaster",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const userIDInput = interaction.fields.getTextInputValue("userIDInput")

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.gamemaster.id != userID) return interaction.reply({content: "Вы не являетесь Гейммастером данной игры!", ephemeral: true})

        const steamID = FindSteamID(userIDInput)
        if (!steamID) return interaction.reply({content: "У данного человека не привязан SteamID!", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        const member = await interaction.guild.members.fetch(userIDInput).catch((error) => {
            interaction.editReply({content: "Упс... что-то пошло не так. (user is undefined)"})
        })
        if (!member) return

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {})
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        const controlMessage : Message | void = await FindControlMessageByID(controlChannel, game.control_message_id).catch((error) => {})
        if (!controlMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (controlMessage is undefined)"})

        game.admins.delete(member.user.id)
        game.gamemaster = {
            tag: member.user.tag,
            id: member.user.id,
            steam_id: steamID,
            avatarURL: member.user.avatarURL()
        }
        game.save()

        const embed = buildEmbeds(interaction, game.characters, game.server, game)
        await controlMessage.edit({embeds: [embed]})

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
        await interaction.deleteReply()
    }
}

export default modal