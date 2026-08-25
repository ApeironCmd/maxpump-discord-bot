import { SelectMenu } from "../types"
import { Vars } from "../structures/Data"
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, StringSelectMenuBuilder } from "discord.js"
import { join } from "path"
import { existsSync } from "fs"
import { GameComponent, UserComponent } from "../structures/Game"
import { FindCharacterByID, GameCharacterComponent } from "../structures/GameCharacters"
import { GameCategoryComponent } from "../structures/GameCategory"

export function buildCategories(obj) : ActionRowBuilder {
    const interaction = obj.interaction
    const client : Client = interaction.client
    const selectCategory : string = obj.selectCategory

    const categories = client.gamecategories

    let obj2 = []
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i]

        obj2.push({
            label: category.title,
            description: category.description,
            value: category.uniqueID,
            default: category.uniqueID == (selectCategory || undefined ) ? true : false,
            emoji: category.emoji ? category.emoji : undefined
        })
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`game.select.category`)
                .setPlaceholder("Выбор главы")
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(...obj2)
        )

    return row
}

export function buildCharacters(obj) : ActionRowBuilder {
    const interaction = obj.interaction
    const client : Client = interaction.client
    const selectCategory : string = obj.selectCategory
    const selectCharacter : string = obj.selectCharacter

    const game : GameComponent = interaction.client.games.get(interaction.channelId)
    if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})    

    const characters : GameCharacterComponent[] = []
    for (const character of client.gamecharacters) characters.push(character)
    for (const character of game.gamecharacters) characters.push(character)

    let removeChars = []
    game.users.forEach((user : UserComponent) => {
        const character = FindCharacterByID(user.character, game)

        if ((user.status === 2 || user.status === 3) && character && character.category != "oc") {
            removeChars.push(user.character)
        }
    })

    const userID = interaction.user.id
    const user = game.users.get(userID)
    if (user && user.characters) {
        for (const charID of user.characters) {
            removeChars.push(charID)
        }
    }

    let countSelect = {}
    game.users.forEach((user : UserComponent) => {
        if (user.status === 1 && user.characters) {
            for (const charID of user.characters) {
                countSelect[charID] = countSelect[charID] || 0
                countSelect[charID]++
            }
        }
    })

    let blockedChars = []
    let blockedCategories = []
    const charactersOfStrings = game.characters.split(", ")
    charactersOfStrings.forEach(element => {
        interaction.client.gamecharacters.forEach((character : GameCharacterComponent) => {
            if (character.name.toLowerCase() == element.toLowerCase()) {
                blockedChars.push(character.name)
            }
        })

        interaction.client.gamecategories.forEach((category : GameCategoryComponent) => {
            if (category.title.toLowerCase() == element.toLowerCase()) {
                blockedCategories.push(category.uniqueID)
            }
        })
    })

    if (characters && selectCategory) {
        let obj2 = []
        for (let i = 0; i < characters.length; i++) {
            const character = characters[i]

            if (character.category && character.uniqueID && character.category == selectCategory) {
                let skip = false

                let found = removeChars.find(element => element == character.uniqueID)
                if (found) {
                    skip = true
                }

                found = blockedChars.find(element => element.toLowerCase() == character.name.toLowerCase())
                if (found) {
                    skip = true
                }

                if (!skip) {
                    found = blockedCategories.find(element => element.toLowerCase() == character.category.toLowerCase())
                    if (found) {
                        skip = true
                    }
                }

                if (!skip) {
                    obj2.push({
                        label: character.name,
                        description: `${character.title}${(countSelect[character.uniqueID] ? ` · +${countSelect[character.uniqueID]}` : "")}`,
                        value: character.uniqueID,
                        default: character.uniqueID == (selectCharacter || undefined ) ? true : false,
                        emoji: character.emoji ? character.emoji : undefined
                    })
                }
            }
        }

        let newObj = obj2
        if (obj2.length <= 0) {
            newObj = [{label: "nothing", value: "nothing"}]
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`game.select.character/${selectCategory}`)
                    .setPlaceholder("Выбор персонажа")
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setDisabled(obj2.length <= 0)
                    .addOptions(...newObj)
            )

        return row
    } else {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`game.select.character/${selectCategory}`)
                    .setPlaceholder("Выбор персонажа")
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setDisabled(true)
                    .addOptions([
                        {label: "nothing", value: "nothing"}
                    ])
            )

        return row
    }
}

function buildAttachment(obj) : AttachmentBuilder | void {
    const selectCharacter : string = obj.selectCharacter

    const path = join(__dirname, `../../assets/characters/${selectCharacter}.png`)

    if (existsSync(path)) {
        const attachment = new AttachmentBuilder(path, {name: `${selectCharacter}.png`})

        return attachment
    }
}

function buildSuccessButton(obj) : ActionRowBuilder {
    const selectCategory : string = obj.selectCategory
    const selectCharacter : string = obj.selectCharacter

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`game.signup.success/${selectCharacter}`)
                .setLabel("Подтвердить выбор")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Secondary)
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel("Подробнее на Wiki")
                .setURL(`https://www.google.com/search?q=${selectCharacter}+danganronpa`)
                .setEmoji("📜")
                .setStyle(ButtonStyle.Link)
                .setDisabled(selectCategory == "oc")
        )

    return row
}

export function getInfo(obj) : Object {
    const categoriesRow = buildCategories(obj)
    const charactersRow = buildCharacters(obj)
    const attachment = buildAttachment(obj)
    const button = buildSuccessButton(obj)

    let embeds = []

    const interaction = obj.interaction
    const game : GameComponent = interaction.client.games.get(interaction.channelId)
    if (game && game.characters != "") {
        let message = ""
        const charactersOfStrings = game.characters.split(", ")
        charactersOfStrings.forEach(element => {        
            interaction.client.gamecharacters.forEach(character => {
                const emoji = character.emoji ? `<:${character.emoji}>` : ""

                if (character.name.toLowerCase() == element.toLowerCase()) {
                    message += `${emoji} ${(character.roleID ? `<@&${character.roleID}>` : character.name)}\n`
                }
            })

            interaction.client.gamecategories.forEach(category => {
                const emoji = category.emoji ? `<:${category.emoji}>` : ""

                if (category.title.toLowerCase() == element.toLowerCase()) {
                    message += `${emoji} ${(category.roleID ? `<@&${category.roleID}>` : category.title)}\n`
                }
            })
        })

        const embed = new EmbedBuilder()
            .setColor([47,49,54])
            .setDescription(`• **Запрещённые персонажи:**\n${message}`)

        embeds.push(embed)
    }

    return [categoriesRow, charactersRow, attachment, button, embeds]
}

const selectMenu : SelectMenu = {
    customId: "game.select.character",
    execute: async (interaction, category) => {
        const userID = interaction.user.id

        const selectCategory = category
        if (!selectCategory) return interaction.reply({content: "Упс... что-то пошло не так. (selectCategory is undefined)", ephemeral: true})

        const selectCharacter = interaction.values[0]
        if (!selectCharacter) return interaction.reply({content: "Упс... что-то пошло не так. (selectCharacter is undefined)", ephemeral: true})

        await interaction.deferUpdate()

        const data = getInfo({interaction: interaction, selectCategory: selectCategory, selectCharacter: selectCharacter})
        const categoriesRow = data[0]
        const charactersRow = data[1]
        const attachment = data[2]
        const button = data[3]

        const files = []
        if (attachment) files.push(attachment)

        await interaction.editReply({embeds: [], components: [categoriesRow, charactersRow, button], files: files})
    }
}

export default selectMenu