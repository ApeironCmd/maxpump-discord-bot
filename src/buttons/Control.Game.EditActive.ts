import { Message } from "discord.js"
import { Button } from "../types"
import { FindControlChannelByID, FindControlMessageByID, FindGameApplyForumByID, FindGameByControlChannelID, FindGameThreadByID } from "../structures/Game"
import { createControlRow } from "../modals/Game.Create"

const button : Button = {
    customId: "control.game.editactive",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        const gameApplyForum = await FindGameApplyForumByID(interaction.guild, game).catch((error) => {})
        if (!gameApplyForum) return interaction.editReply({content: "Упс... что-то пошло не так. (gameApplyForum is undefined)"})

        const gameThread = await FindGameThreadByID(gameApplyForum, game.game_id).catch((error) => {})
        if (!gameThread) return interaction.editReply({content: "Упс... что-то пошло не так. (gameThread is undefined)"})

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {})
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        const controlMessage : Message | void = await FindControlMessageByID(controlChannel, game.control_message_id).catch((error) => {})
        if (!controlMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (controlMessage is undefined)"})

        game.active = !game.active
        game.save()

        controlMessage.edit({components: createControlRow(game)})

        await interaction.editReply({content: "Готово!"})
    }
}

export default button