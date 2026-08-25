import { GetData, SetData } from "./Data";

export function AddInteractionArgs(id : string, args : Object) : void {
    let data = GetData("interactionsargs", {})
    data[id] = args

    SetData("interactionsargs", data)
}

export function GetInteractionsArgs(id : string, arg? : string) : any {
    const data = GetData("interactionsargs", {})

    if (data && (typeof(data) == "object") && arg) {
        return data[id][arg]
    }

    return data[id]
}

export function RemoveInteractionArgs(id : string) : void {
    const data = GetData("interactionsargs", {})
    data[id] = undefined

    SetData("interactionsargs", data)
}