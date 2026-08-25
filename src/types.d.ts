import { SlashCommandBuilder, CommandInteraction, Collection, AutocompleteInteraction, ModalSubmitInteraction, ButtonInteraction, StringSelectMenuInteraction } from "discord.js"
import { GameComponent } from "./structures/Game"
import { GameCategoryComponent } from "./structures/GameCategory"
import { GameCharacterComponent } from "./structures/GameCharacters"

export interface SlashCommand {
    command: SlashCommandBuilder | any,
    execute: (interaction : CommandInteraction, ...args: string[]) => void,
    autocomplete?: (interaction: AutocompleteInteraction) => void,
    cooldown?: number,
    roles?: Object
}

export interface SubCommand {
    id: string
    execute: (interaction : CommandInteraction, ...args: string[]) => void
}

export interface Modal {
    customId: string,
    execute: (interaction : ModalSubmitInteraction, ...args: string[]) => void,
}

export interface Button {
    customId: string,
    execute: (interaction : ButtonInteraction, ...args: string[]) => void,
}

export interface SelectMenu {
    customId: string,
    execute: (interaction : StringSelectMenuInteraction, ...args: string[]) => void,
}

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, SlashCommand>,
        subcommands: Collection<string, SubCommand>,
        cooldowns: Collection<string, number>,
        modals: Collection<string, Modal>,
        buttons: Collection<string, Button>,
        select_menus: Collection<string, SelectMenu>,

        games: Collection<string, GameComponent>,
        gamecategories: GameCategoryComponent[],
        gamecharacters: GameCharacterComponent[]
    }
}