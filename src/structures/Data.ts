import { readFileSync, writeFileSync, unlinkSync } from "fs"
import { join } from "path"

export var Vars = {}
var path = "../../data/"

export function SetData(key : string, value : any) {
    writeFileSync(join(__dirname, path + key + ".json"), JSON.stringify(value))
}

export function SetVar(key : string, value : any) {
    Vars[key] = value
}

export function GetData(key : string, standart? : any, refresh? : boolean) : any {
    const contents = readFileSync(join(__dirname, path + key + ".json"), 'utf-8')
    if (contents && contents != "") {
        try {
            let value = JSON.parse(contents)

            if (value) {
                return value
            }
        } catch (error) {
            console.error(error)
        }
    }

    return standart
}

export function GetVar(key : string, standart? : any) : any {
    let value = Vars[key]

    if (value) {
        return value
    }

    return standart
}

export function DeleteData(key : string) : boolean {
    const contents = readFileSync(join(__dirname, path + key + ".json"), 'utf-8')

    if (contents && contents != "") {
        unlinkSync(join(__dirname, path + key + ".json"))
 
        return true
    }

    return false
}