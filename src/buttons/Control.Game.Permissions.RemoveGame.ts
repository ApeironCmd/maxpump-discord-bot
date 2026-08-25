import { Button } from "../types"
import { FindControlChannelByID, FindGameApplyForumByID, FindGameByControlChannelID, FindGameThreadByID, GameComponent } from "../structures/Game"
import { GetData, SetData } from "../structures/Data"

const button : Button = {
    customId: "control.game.permissions.removegame",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.gamemaster.id != userID) return interaction.reply({content: "Вы не являетесь Гейммастером данной игры!", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {})
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        const gameApplyForum = await FindGameApplyForumByID(interaction.guild, game).catch((error) => {})
        if (!gameApplyForum) return interaction.editReply({content: "Упс... что-то пошло не так. (gameApplyForum is undefined)"})

        const gameThread = await FindGameThreadByID(gameApplyForum, game.game_id).catch((error) => {})
        if (!gameThread) return interaction.editReply({content: "Упс... что-то пошло не так. (gameThread is undefined)"})

        const gameID = game.game_id

        let games_archive : GameComponent = GetData("games_archive", {})
        games_archive[gameID] = game.json()
        SetData("games_archive", games_archive)

        interaction.client.games.delete(gameID)
        let games : GameComponent = GetData("games", {})
        games[gameID] = undefined
        SetData("games", games)

        await controlChannel.delete()

        gameThread.edit({
            archived: true,
            locked: true
        })
    }
}

export default button