import express from "express"
import bodyParser from "body-parser"
import { GetData } from "./structures/Data"
import obfuscator from "../libs/obfuscator.js"

const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

function error404(req : any, res? : any) : Object | void {
    const obj = {
        code: 404,
        message: `Cannot ${req.method} ${req.url}`
    }

    if (res) {
        res.send(obj)
    } else {
        return obj
    }
}

app.get("/discord/*", (req, res) => {
    const url : string = req.url.replace("/discord/", "")

    res.redirect(`discord://_/${url}`)
})

app.get("/steam/*", (req, res) => {
    const url : string = req.url.replace("/steam/", "")

    res.redirect(`steam://${url}`)
})

app.post("/minifer", (req, res) => {
    if (!req.body) return

    let code : string = req.body.code
    if (!code) return

    try {
		code = obfuscator.Minifer(code)
	} catch (error) {}

    res.send(code)
})

app.post("/obfuscator", (req, res) => {
    if (!req.body) return

    let code : string = req.body.code
    if (!code) return

    try {
		code = obfuscator.Minifer(code)

		try {
			code = obfuscator.Encode(code)
		} catch (error) {}
	} catch (error) {}

    res.send(code)
})

function FindGameByID(id : string, full : boolean) : Object | any {
    const data : Object = GetData("games")
    let find = false
    let obj = {}

    Object.values(data).forEach(game => {
        if (game["game_id"] == id) {
            find = true

            if (full) {
                obj = game
            } else {
                obj = {
                    active: game["active"],
                    private: game["private"],

                    title: game["title"],
                    description: game["description"],
                    tags: game["tags"],
                    characters: game["characters"],
                    server: game["server"],

                    game_id: game["game_id"],
                    gamemaster: {
                        tag: game["gamemaster"]["tag"],
                        id: game["gamemaster"]["id"]
                    }
                }
            }
        }
    })

    if (find) {
        return obj
    }
}

app.get("/academy/games", (req, res) => {
    const data : Object = GetData("games")

    let obj = {}
    Object.values(data).forEach(game => {
        obj[game["game_id"]] = FindGameByID(game["game_id"], false)
    })

    res.send(obj)
})

app.post("/academy/games", (req, res) => {
    if (!req.body) return

    const token : string = req.body.token
    if (!token) return

    const data : Object = GetData("games")
    let game_id = undefined

    Object.values(data).forEach(game => {
        if (game.token === token) {
            game_id = game.game_id
        }
    })

    const game = FindGameByID(game_id, true)
    if (game) {
        res.send(game)
    } else error404(req, res)
})

app.get("/academy/games/*", (req, res) => {
    const id : string = req.url.replace("/academy/games/", "")
    const game = FindGameByID(id, false)

    if (game) {
        res.send(game)
    } else error404(req, res)
})


app.get("/academy/servers", (req, res) => {
    const data : Object = GetData("servers")

    res.send(data)
})

app.get("/academy/servers/*", (req, res) => {
    // const url = req.url
    // if (url.search("/connect")) {

    // } else {
        const data = GetData("servers")
        const id : number = Number(req.url.replace("/academy/servers/", ""))
        const server = data[id - 1]

        if (server) {
            res.send(server)
        } else error404(req, res)
    // }
})

app.get("*", (req, res) => {
    error404(req, res)
})

app.listen(80, () => {
    console.log(`[server]: Server is running at http://localhost:${80}`)
})