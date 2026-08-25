export interface GameStatusComponent {
    title : string
    description : string
    roleID : string
    dmMessage? : string
    notifyMessage? : string
}

class GameStatus implements GameStatusComponent {
    public title : string = undefined!
    public description : string = undefined!
    public roleID : string = undefined!
    public dmMessage : string = undefined!
    public notifyMessage? : string = undefined!

    public setTitle(title: string) {
        this.title = title

        return this
    }

    public setDescription(description: string) {
        this.description = description

        return this
    }

    public setRoleID(roleID: string) {
        this.roleID = roleID

        return this
    }

    public setDMMessage(dmMessage: string) {
        this.dmMessage = dmMessage

        return this
    }

    public setNotifyMessage(notifyMessage: string) {
        this.notifyMessage = notifyMessage

        return this
    }
}

var Status = [
    new GameStatus()
        .setTitle("На рассмотрении")
        .setDescription("Текущий статус {0}, ожидает итогового решения от курирующего Гейм Мастера. Для управления используйте элементы выпадающего меню.")
        .setDMMessage("Ваш текущий статус **\"На рассмотрении\"**, ожидайте итогового решения от курирующего Гейм Мастера.")
        .setNotifyMessage("К сожалению вы не попали на предстоящую игру!"),
        // .setRoleID("1077496057040224296"),
    new GameStatus()
        .setTitle("Одобрено")
        .setDescription("Текущий статус {0}, участник принят в основной состав предстоящей игры. Для управления используйте элементы выпадающего меню.")
        .setDMMessage("Ваш текущий статус **\"Одобрено\"**, вы приняты в основной состав предстоящей игры.")
        .setNotifyMessage("Вы попали на предстоящую игру!\nВаш персонаж: {0}"),
        // .setRoleID("1077496007945879612"),
    new GameStatus()
        .setTitle("Игрок в запасе")
        .setDescription("Текущий статус {0}, участник ожидает предстоящей игры в запасном составе. Для управления используйте элементы выпадающего меню.")
        .setDMMessage("Ваш текущий статус **\"Игрок в запасе\"**, вы ожидаете предстоящую игру в запасном составе.")
        .setNotifyMessage("Вы попали на предстоящую игру, но находитесь в запасном составе!\nВаш персонаж: {0}"),
        // .setRoleID("1077496159783899146"),
    new GameStatus()
        .setTitle("Отклонено")
        .setDescription("Текущий статус {0}, участнику отказано во вступлении в предстоящую игру. Для управления используйте элементы выпадающего меню.")
        .setDMMessage("Ваш текущий статус **\"Отклонено\"**, вам отказано во вступлении в предстоящую игру.")
        .setNotifyMessage("К сожалению вы не попали на предстоящую игру!"),
        // .setRoleID("1077496087172087848"),
]

export function GetStatusByID(id : number) : GameStatus {
    return Status[id - 1]
}