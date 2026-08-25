import { readdirSync } from "fs"
import { join } from "path"

var Hooks = {}

export function Add(event_name : string, name : string, func : Function) {
    if (!Hooks[event_name]) {
        Hooks[event_name] = {}
    }

    Hooks[event_name][name] = func
}

export function Remove(event_name : string, name : string) {
    if (!Hooks[event_name]) return

    Hooks[event_name][name] = () => {}
}

export function Run(name : string, ...args : any) : any {
    if (Hooks[name] && Object.keys(Hooks[name]).length > 0) {
        let a = undefined

        Object.values(Hooks[name]).forEach((v : Function) => {
            if (typeof(v) === "function") {
                const b = v(...args)

                if (b) {
                    a = b
                }
            }
        })

        if (a) {
            return a
        }
    }
}

export function hookBuild() {
    const hooksDir = join(__dirname, "../hooks")

    readdirSync(hooksDir).forEach(file => {
        const path : string = `${hooksDir}/${file}`

        require(path)
        console.log(`Successfully loaded Hook: "${file}"`)
    })
}