export interface GameCategoryComponent {
    title : string
    description : string
    uniqueID : string
    emoji? : string
    roleID? : string
}

class GameCategory implements GameCategoryComponent {
    public title : string = undefined!
    public description : string = undefined!
    public uniqueID : string = undefined!
    public emoji : string = undefined!
    public roleID : string = undefined!

    public setTitle(title : string) {
        this.title = title

        return this
    }

    public setDescription(description : string) {
        this.description = description

        return this
    }

    public setUniqueID(uniqueID : string) {
        this.uniqueID = uniqueID

        return this
    }

    public setEmoji(emoji : string) {
        this.emoji = emoji

        return this
    }

    public setRoleID(roleID : string) {
        this.roleID = roleID

        return this
    }
}

export function FindCategoryByID(uniqueID: string): GameCategoryComponent {
    for (const category of categoriesList) {
        if (category.uniqueID == uniqueID) {
            return category
        }
    }
}

var categoriesList : GameCategory[] = [
    new GameCategory()
        .setTitle("Trigger Happy Havoc")
        .setDescription("78-ой класс Академии «Пик Надежды».")
        .setUniqueID("thh")
        .setEmoji("thh:1088715223650811984"),
        // .setRoleID("1081004924600594554"),
    new GameCategory()
        .setTitle("Goodbye Despair")
        .setDescription("77-ой «B» класс Академии «Пик Надежды».")
        .setUniqueID("gd")
        .setEmoji("gd:1088715219968217168"),
        // .setRoleID("1081004971530666125"),
    new GameCategory()
        .setTitle("Killing Harmony")
        .setDescription("«Абсолютная Академия Одарённых Узников».")
        .setUniqueID("kh")
        .setEmoji("kh:1088715216625356830"),
        // .setRoleID("1081005017206632598"),
    new GameCategory()
        .setTitle("Ultra Despair Girls")
        .setDescription("«Динамическое Сафари» в Това Сити.")
        .setUniqueID("udg")
        .setEmoji("udg:1088715212997283860"),
        // .setRoleID("1081005087805157507"),
    new GameCategory()
        .setTitle("Program Future")
        .setDescription("Специальная программа «Фонд Будущего».")
        .setUniqueID("pf")
        .setEmoji("pt:1088715210195468298"),
    new GameCategory()
        .setTitle("Personal Talents")
        .setDescription("Уникальные персонажи, созданные для вас.")
        .setUniqueID("pt")
        .setEmoji("pt:1088715210195468298"),
    new GameCategory()
        .setTitle("Original Characters")
        .setDescription("Оригинальные персонажи созданные для игры.")
        .setUniqueID("oc")
        .setEmoji("oc:1088715226377109576"),
]

export default categoriesList