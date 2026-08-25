import { Button } from "../types"
import { LoadPage } from "./Game.PlayersList"

const button : Button = {
    customId: "game.playerslist.page",
    execute: async (interaction, page, isFull) => {
        LoadPage(interaction, Number(page), isFull === "true", true)
    }
}

export default button