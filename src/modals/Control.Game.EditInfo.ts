import { Message } from "discord.js"
import { FindControlChannelByID, FindControlMessageByID, FindGameApplyForumByID, FindGameByControlChannelID, FindGameThreadByID } from "../structures/Game"
import { Modal } from "../types"
import { buildEmbeds } from "./Game.Create"

const modal : Modal = {
    customId: "control.game.editinfo",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const synopsisInput = interaction.fields.getTextInputValue("synopsisInput") || ""
        const specificationsInput = interaction.fields.getTextInputValue("specificationsInput") || ""
        const additionalInput = interaction.fields.getTextInputValue("additionalInput") || ""
        const charactersInput = interaction.fields.getTextInputValue("charactersInput") || ""
        const serverInput = interaction.fields.getTextInputValue("serverInput")

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {})
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        const controlMessage : Message | void = await FindControlMessageByID(controlChannel, game.control_message_id).catch((error) => {})
        if (!controlMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (controlMessage is undefined)"})

        const gameApplyForum = await FindGameApplyForumByID(interaction.guild, game).catch((error) => {})
        if (!gameApplyForum) return interaction.editReply({content: "Упс... что-то пошло не так. (gameApplyForum is undefined)"})

        const gameThread = await FindGameThreadByID(gameApplyForum, game.game_id).catch((error) => {})
        if (!gameThread) return interaction.editReply({content: "Упс... что-то пошло не так. (gameThread is undefined)"})

        if (synopsisInput != "") {
            const message = await gameThread.messages.fetch(game.synopsis_id)
            if (message) {
                await message.edit({files: [synopsisInput]})
            }
        }

        if (specificationsInput != "") {
            const message = await gameThread.messages.fetch(game.specifications_id)
            if (message) {
                await message.edit({files: [specificationsInput]})
            }
        }

        if (additionalInput != "") {
            const message = await gameThread.messages.fetch(game.additional_id)
            if (message) {
                await message.edit({files: [additionalInput]})
            }
        }

        game.characters = charactersInput
        game.server = serverInput
        game.save()

        const embed = buildEmbeds(interaction, charactersInput, serverInput, game)
        await controlMessage.edit({embeds: [embed]})

        interaction.editReply("Изменено!")
    }
}

export default modal