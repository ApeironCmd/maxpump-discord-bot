import { GameComponent, UserComponent } from "./Game"

export interface GameCharacterComponent {
    name : string
    title? : string
    category? : string
    uniqueID? : string
    emoji? : string
    roleID? : string
}

export class GameCharacter implements GameCharacterComponent {
    public name : string = undefined!
    public title : string = undefined!
    public category : string = undefined!
    public uniqueID : string = undefined!
    public emoji : string = undefined!
    public roleID : string = undefined!

    public setName(name : string) {
        this.name = name

        return this
    }

    public setTitle(title : string) {
        this.title = title

        return this
    }

    public setCategory(category : string) {
        this.category = category

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

export function FindCharacterByID(uniqueID: string, game?: GameComponent): GameCharacterComponent {
    let characters : GameCharacterComponent[] = []
    for (const character of charactersList) {
        characters.push(character)
    }

    if (game) {
        for (const character of game.gamecharacters) {
            characters.push(character)
        }
    }

    for (const character of characters) {
        if (character.uniqueID == uniqueID) {
            return character
        }
    }
}

export function CreateCharacterText(user : UserComponent, game? : GameComponent, disablePingRole? : boolean) : string {
    let characterText = ""
    if (user.character) {
        const character = FindCharacterByID(user.character, game)

        const emoji = character.emoji ? `<:${character.emoji}>` : ""
        characterText = `${emoji} ${((character.roleID && !disablePingRole) ? `<@&${character.roleID}>` : character.name)}\n`
    } else {
        for (const charID of user.characters) {
            const character = FindCharacterByID(charID, game)

            const emoji = character.emoji ? `<:${character.emoji}>` : ""
            characterText += `${emoji} ${((character.roleID && !disablePingRole) ? `<@&${character.roleID}>` : character.name)}\n`
        }
    }

    return characterText
}

var charactersList : GameCharacter[] = [
    // Trigger Happy Havoc
    new GameCharacter()
        .setName("Саяка Майзоно")
        .setTitle("Абсолютная Поп-Звезда")
        .setCategory("thh")
        .setUniqueID("sayaka")
        .setEmoji("sayaka:1088719961989578772"),
        // .setRoleID("1078731094448427148"),
    new GameCharacter()
        .setName("Токо Фукава")
        .setTitle("Абсолютная Писательница")
        .setCategory("thh")
        .setUniqueID("toko")
        .setEmoji("toko:1088720922418090004"),
        // .setRoleID("1078731095954182274"),
    new GameCharacter()
        .setName("Киётака Ишимару")
        .setTitle("Абсолютный Дежурный")
        .setCategory("thh")
        .setUniqueID("kiyotaka")
        .setEmoji("kiyotaka:1088721530789310474"),
        // .setRoleID("1078731097061462157"),
    new GameCharacter()
        .setName("Ясухиро Хагакурэ")
        .setTitle("Абсолютный Предсказатель")
        .setCategory("thh")
        .setUniqueID("yasuhiro")
        .setEmoji("yasuhiro:1088721843432738946"),
        // .setRoleID("1078731098797916232"),
    new GameCharacter()
        .setName("Джунко Эношима")
        .setTitle("Абсолютная Модница")
        .setCategory("thh")
        .setUniqueID("junko")
        .setEmoji("junko:1088722268143759481"),
        // .setRoleID("1078731100320436224"),
    new GameCharacter()
        .setName("Кёко Киригири")
        .setTitle("Абсолютный Детектив")
        .setCategory("thh")
        .setUniqueID("kyoko")
        .setEmoji("kyoko:1088722642317606992"),
        // .setRoleID("1078731101599711272"),
    new GameCharacter()
        .setName("Макото Наэги")
        .setTitle("Абсолютный Счастливчик")
        .setCategory("thh")
        .setUniqueID("makoto")
        .setEmoji("makoto:1088723068861546606"),
        // .setRoleID("1078731102954455090"),
    new GameCharacter()
        .setName("Леон Кувата")
        .setTitle("Абсолютный Бейсболист")
        .setCategory("thh")
        .setUniqueID("leon")
        .setEmoji("leon:1088725529978470470"),
        // .setRoleID("1078731104078545026"),
    new GameCharacter()
        .setName("Мондо Овада")
        .setTitle("Абсолютный Лидер Банды Байкеров")
        .setCategory("thh")
        .setUniqueID("mondo")
        .setEmoji("mondo:1088726386426007643"),
        // .setRoleID("1078731105148092416"),
    new GameCharacter()
        .setName("Хифуми Ямада")
        .setTitle("Абсолютный Автор Фанфиков")
        .setCategory("thh")
        .setUniqueID("hifumi")
        .setEmoji("hifumi:1088726743130583080"),
        // .setRoleID("1078731106645459045"),
    new GameCharacter()
        .setName("Чихиро Фуджисаки")
        .setTitle("Абсолютный Программист")
        .setCategory("thh")
        .setUniqueID("chihiro")
        .setEmoji("chihiro:1088727110337695746"),
        // .setRoleID("1078731107962458162"),
    new GameCharacter()
        .setName("Аой Асахина")
        .setTitle("Абсолютный Пловец")
        .setCategory("thh")
        .setUniqueID("aoi")
        .setEmoji("aoi:1088731047501504532"),
        // .setRoleID("1078731109069758585"),
    new GameCharacter()
        .setName("Селестия Люденберг")
        .setTitle("Абсолютный Азартный Игрок")
        .setCategory("thh")
        .setUniqueID("celestia")
        .setEmoji("celestia:1088728698875817994"),
        // .setRoleID("1078731110198026260"),
    new GameCharacter()
        .setName("Бьякуя Тогами")
        .setTitle("Абсолютный Наследник")
        .setCategory("thh")
        .setUniqueID("byakuya")
        .setEmoji("byakuya:1088729656259248179"),
        // .setRoleID("1078731111137546321"),
    new GameCharacter()
        .setName("Сакура Огами")
        .setTitle("Абсолютный Мастер Боевых Искусств")
        .setCategory("thh")
        .setUniqueID("sakura")
        .setEmoji("sakura:1088729744155082772"),
        // .setRoleID("1078731112647495731"),

    // Goodbye Dispair
    new GameCharacter()
        .setName("Нагито Комаэда")
        .setTitle("Абсолютный Везунчик")
        .setCategory("gd")
        .setUniqueID("nagito")
        .setEmoji("nagito:1088741040183332874"),
        // .setRoleID("1078731114094526474"),
    new GameCharacter()
        .setName("Хиёко Сайонджии")
        .setTitle("Абсолютный Традиционный Танцор")
        .setCategory("gd")
        .setUniqueID("hiyoko")
        .setEmoji("hiyoko:1088741464625909782"),
        // .setRoleID("1078731115352825936"),
    new GameCharacter()
        .setName("Ибуки Миода")
        .setTitle("Абсолютный Музыкант")
        .setCategory("gd")
        .setUniqueID("ibuki")
        .setEmoji("ibuki:1088741614261907476"),
        // .setRoleID("1078731116992794634"),
    new GameCharacter()
        .setName("Хаджимэ Хината")
        .setTitle("Абсолютный ???")
        .setCategory("gd")
        .setUniqueID("hajime")
        .setEmoji("hajime:1088741719782203392"),
        // .setRoleID("1078731118364336148"),
    new GameCharacter()
        .setName("Фуюхико Кузурю")
        .setTitle("Абсолютный Якудза")
        .setCategory("gd")
        .setUniqueID("fuyuhiko")
        .setEmoji("fuyuhiko:1088741797922082816"),
        // .setRoleID("1078731119647785090"),
    new GameCharacter()
        .setName("Гандам Танака")
        .setTitle("Абсолютный Животновод")
        .setCategory("gd")
        .setUniqueID("gundham")
        .setEmoji("gundham:1088742176546115595"),
        // .setRoleID("1078731120780259418"),
    new GameCharacter()
        .setName("Чиаки Нанами")
        .setTitle("Абсолютный Геймер")
        .setCategory("gd")
        .setUniqueID("chiaki")
        .setEmoji("chiaki:1088742347308793937"),
        // .setRoleID("1078731121954656368"),
    new GameCharacter()
        .setName("Казуичи Сода")
        .setTitle("Абсолютный Механик")
        .setCategory("gd")
        .setUniqueID("kazuichi")
        .setEmoji("kazuichi:1088742414216335432"),
        // .setRoleID("1078731123720470610"),
    new GameCharacter()
        .setName("Нэкомару Нидай")
        .setTitle("Абсолютный Тренер")
        .setCategory("gd")
        .setUniqueID("nekomaru")
        .setEmoji("nekomaru:1088742503206887464"),
        // .setRoleID("1078731124844527696"),
    new GameCharacter()
        .setName("Бьякуя Тугами")
        .setTitle("Абсолютный Самозванец")
        .setCategory("gd")
        .setUniqueID("twogami")
        .setEmoji("twogami:1088742607749910548"),
        // .setRoleID("1078731125805039668"),
    new GameCharacter()
        .setName("Микан Цумики")
        .setTitle("Абсолютная Медсестра")
        .setCategory("gd")
        .setUniqueID("mikan")
        .setEmoji("mikan:1088742697659011112"),
        // .setRoleID("1078731127273037944"),
    new GameCharacter()
        .setName("Тэрутэру Ханамура")
        .setTitle("Абсолютный Повар")
        .setCategory("gd")
        .setUniqueID("teruteru")
        .setEmoji("teruteru:1088742819407089724"),
        // .setRoleID("1078731128426463343"),
    new GameCharacter()
        .setName("Пеко Пекояма")
        .setTitle("Абсолютная Мечница")
        .setCategory("gd")
        .setUniqueID("peko")
        .setEmoji("peko:1088742972113305671"),
        // .setRoleID("1078731129529569300"),
    new GameCharacter()
        .setName("Сония Невермайнд")
        .setTitle("Абсолютная Принцесса")
        .setCategory("gd")
        .setUniqueID("sonia")
        .setEmoji("sonia:1088743032288976907"),
        // .setRoleID("1078731130615890003"),
    new GameCharacter()
        .setName("Аканэ Овари")
        .setTitle("Абсолютная Гимнастка")
        .setCategory("gd")
        .setUniqueID("akane")
        .setEmoji("akane:1088743089063084083"),
        // .setRoleID("1078731131773517894"),
    new GameCharacter()
        .setName("Махиру Коизуми")
        .setTitle("Абсолютный Фотограф")
        .setCategory("gd")
        .setUniqueID("mahiru")
        .setEmoji("mahiru:1088743171334340638"),
        // .setRoleID("1078731132872441907"),

    // Killing Harmony
    new GameCharacter()
        .setName("Анджи Ёнага")
        .setTitle("Абсолютная Художница")
        .setCategory("kh")
        .setUniqueID("angie")
        .setEmoji("angie:1088782797042364457"),
        // .setRoleID("1078731134353014885"),
    new GameCharacter()
        .setName("Кайто Момота")
        .setTitle("Абсолютный Астронавт")
        .setCategory("kh")
        .setUniqueID("kaito")
        .setEmoji("kaito:1088782892504711179"),
        // .setRoleID("1078731135829418094"),
    new GameCharacter()
        .setName("Кируми Тоджо")
        .setTitle("Абсолютная Горничная")
        .setCategory("kh")
        .setUniqueID("kirumi")
        .setEmoji("kirumi:1088783011601977385"),
        // .setRoleID("1078731137280643202"),
    new GameCharacter()
        .setName("Кокичи Ома")
        .setTitle("Абсолютный Верховный Лидер")
        .setCategory("kh")
        .setUniqueID("kokichi")
        .setEmoji("kokichi:1088783241546301460"),
        // .setRoleID("1078731138375372890"),
    new GameCharacter()
        .setName("Каэде Акамацу")
        .setTitle("Абсолютная Пианистка")
        .setCategory("kh")
        .setUniqueID("kaede")
        .setEmoji("kaede:1088783346823348305"),
        // .setRoleID("1078731139453288579"),
    new GameCharacter()
        .setName("Химико Юмено")
        .setTitle("Абсолютная Фокусница")
        .setCategory("kh")
        .setUniqueID("himiko")
        .setEmoji("himiko:1088783404138516563"),
        // .setRoleID("1078731142972330064"),
    new GameCharacter()
        .setName("K1-B0")
        .setTitle("Абсолютный Робот")
        .setCategory("kh")
        .setUniqueID("k1b0")
        .setEmoji("k1b0:1088783557947817996"),
        // .setRoleID("1078731143790211144"),
    new GameCharacter()
        .setName("Гонта Гокухара")
        .setTitle("Абсолютный Энтомолог")
        .setCategory("kh")
        .setUniqueID("gonta")
        .setEmoji("gonta:1088783782657663077"),
        // .setRoleID("1078731145535045722"),
    new GameCharacter()
        .setName("Корекиё Шингуджи")
        .setTitle("Абсолютный Антрополог")
        .setCategory("kh")
        .setUniqueID("korekiyo")
        .setEmoji("korekiyo:1088783839658258472"),
        // .setRoleID("1078731149859368990"),
    new GameCharacter()
        .setName("Миу Ирума")
        .setTitle("Абсолютный Изобретатель")
        .setCategory("kh")
        .setUniqueID("miu")
        .setEmoji("miu:1088783892074483823"),
        // .setRoleID("1078731151163785397"),
    new GameCharacter()
        .setName("Тенко Чабашира")
        .setTitle("Абсолютный Мастер Айкидо")
        .setCategory("kh")
        .setUniqueID("tenko")
        .setEmoji("tenko:1088783948831797339"),
        // .setRoleID("1078731152250122350"),
    new GameCharacter()
        .setName("Цумуги Широганэ")
        .setTitle("Абсолютный Косплеер")
        .setCategory("kh")
        .setUniqueID("tsumugi")
        .setEmoji("tsumugi:1088784003844292659"),
        // .setRoleID("1078731152996696149"),
    new GameCharacter()
        .setName("Маки Харукава")
        .setTitle("Абсолютная Воспитательница")
        .setCategory("kh")
        .setUniqueID("maki")
        .setEmoji("maki:1088784057804005396"),
        // .setRoleID("1078731154653450330"),
    new GameCharacter()
        .setName("Шуичи Сайхара")
        .setTitle("Абсолютный Детектив")
        .setCategory("kh")
        .setUniqueID("shuichi")
        .setEmoji("shuichi:1088784778553212999"),
        // .setRoleID("1078731155639111781"),
    new GameCharacter()
        .setName("Рантаро Амами")
        .setTitle("Абсолютный Авантюрист")
        .setCategory("kh")
        .setUniqueID("rantaro")
        .setEmoji("rantaro:1088784832798150657"),
        // .setRoleID("1078731157144871112"),
    new GameCharacter()
        .setName("Рёма Хоши")
        .setTitle("Абсолютный Теннисист")
        .setCategory("kh")
        .setUniqueID("ryoma")
        .setEmoji("ryoma:1088784881909256276"),
        // .setRoleID("1078731158172479518"),

    // Ultra Dispair Girls
    new GameCharacter()
        .setName("Джатаро Кемури")
        .setTitle("Юный Абсолютный Художник")
        .setCategory("udg")
        .setUniqueID("jataro")
        .setEmoji("jataro:1088796626459557991"),
        // .setRoleID("1078731159338487920"),
    new GameCharacter()
        .setName("Комару Наэги")
        .setTitle("Абсолютная Младшая Сестра Надежды")
        .setCategory("udg")
        .setUniqueID("komaru")
        .setEmoji("komaru:1088796760840872016"),
        // .setRoleID("1078731160064114729"),
    new GameCharacter()
        .setName("Монака Това")
        .setTitle("Юная Абсолютная Староста")
        .setCategory("udg")
        .setUniqueID("monaca")
        .setEmoji("monaca:1088796854189293689"),
        // .setRoleID("1078731161574055977"),
    new GameCharacter()
        .setName("Котоко Уцуги")
        .setTitle("Юная Абсолютная Актриса")
        .setCategory("udg")
        .setUniqueID("kotoko")
        .setEmoji("kotoko:1088796974960091196"),
        // .setRoleID("1078731163088211999"),
    new GameCharacter()
        .setName("Нагиса Шингецу")
        .setTitle("Юный Абсолютный Обществовед")
        .setCategory("udg")
        .setUniqueID("nagisa")
        .setEmoji("nagisa:1088797089628160041"),
        // .setRoleID("1078731164472316044"),
    new GameCharacter()
        .setName("Масару Даймон")
        .setTitle("Юный Абсолютный Спортсмен")
        .setCategory("udg")
        .setUniqueID("masaru")
        .setEmoji("masaru:1088797196612284486"),
        // .setRoleID("1078731165667704982"),
]

export default charactersList