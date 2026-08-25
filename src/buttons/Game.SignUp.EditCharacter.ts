import { AttachmentBuilder, ButtonInteraction, ModalSubmitInteraction } from "discord.js"
import { Button } from "../types"
import { GetSteamID } from "../structures/SteamID"
import { join } from "path"
import { getInfo } from "../select_menus/Game.Select.Character"

const button : Button = {
    customId: "game.signup.editcharacter",
    execute: async (interaction) => {
        const userID = interaction.user.id

        GetSteamID(interaction, userID, async (interaction : ButtonInteraction | ModalSubmitInteraction, userSteamID : string) => {
            const game = interaction.client.games.get(interaction.channelId)
            if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true}).catch((error) => {})

            const user = game.users.get(userID)
            if (!user) return interaction.reply({content: "Упс... что-то пошло не так. (user is undefined)", ephemeral: true}).catch((error) => {})

            await interaction.deferUpdate()

            const data = getInfo({interaction: interaction})
            const categoriesRow = data[0]
            const charactersRow = data[1]
            const embeds = data[4]

            const attachment = new AttachmentBuilder(join(__dirname, "../../assets/GameSelectCategory.png"), {name: "GameSelectCategory.png"})

            await interaction.editReply({embeds: embeds, components: [categoriesRow, charactersRow], files: [attachment]}).catch((error) => {})
        })
    }
}

export default button