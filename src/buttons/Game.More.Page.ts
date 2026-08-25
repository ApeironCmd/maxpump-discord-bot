import { Button } from "../types"
import { LoadMore } from "./Game.More"

const button : Button = {
    customId: "game.more.page",
    execute: async (interaction, page, isFull) => {
        LoadMore(interaction, Number(page), true)
    }
}

export default button