import { SelectMenu } from "../types"
import { Vars } from "../structures/Data"
import { AttachmentBuilder } from "discord.js"
import { join } from "path"
import { getInfo } from "./Game.Select.Character"

const selectMenu : SelectMenu = {
    customId: "game.select.category",
    execute: async (interaction) => {
        const category_id = interaction.values[0]
        if (!category_id) return interaction.reply({content: "Упс... что-то пошло не так. (category_id is undefined)", ephemeral: true})

        await interaction.deferUpdate()

        const data = getInfo({interaction: interaction, selectCategory: category_id})
        const categoriesRow = data[0]
        const charactersRow = data[1]
        const embeds = data[4]

        const attachment = new AttachmentBuilder(join(__dirname, "../../assets/GameSelectCategory.png"), {name: "GameSelectCategory.png"})

        await interaction.editReply({embeds: embeds, components: [categoriesRow, charactersRow], files: [attachment]})
    }
}

export default selectMenu