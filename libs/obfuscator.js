const luamin = require("./luamin.js")

const encryptionMap = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь", "э", "ю", "я", "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я"]
const encryptionInt = {"1": "+", "2": "-", "3": "_", "4": "<", "5": ">", "6": ".", "7": "]", "8": "[", "9": "?", "0": "&"}

function getOppositeCharacter(c) {
	for (let i2 = 0; i2 < encryptionMap.length; i2++) {
		if (encryptionMap[i2] === c) {
			return encryptionMap[encryptionMap.length - i2 - 1]
		}
	}
}

function getOppositeCharacters(str) {
	let output = ""

	for (let i = 0; i < str.length; i++) {
		let c = str[i]

		let a = getOppositeCharacter(c)
		if (a) {
			output += a
		} else {
			output += c
		}
	}

	return output
}

function convertIntToChar(str) {
	let output = ""

	for (let i = 0; i < str.length; i++) {
		const c = str[i]
		const a = encryptionInt[c]

		output += a
	}

	return output
}

function convertCharToKey(str) {
	let output = ""
	let bytes = 613

	for (let i = 0; i < str.length; i++) {
		let c = str[i]
		let key = null

		for (let j = 0; j < encryptionMap.length; j++) {
			if (c === encryptionMap[j]) {
				key = j
			}
		}

		if (key !== null) {
			key = key + 1
			let replacement = (key + bytes).toString()
			let int = convertIntToChar(replacement)

			output += "^" + int + "^"
		} else {
			output += c
		}
	}

	return output
}

function encode(str) {
	let output = getOppositeCharacters(str)
	output = convertCharToKey(output)

	return output
}

function generateCode(code) {
	return `("ASTERION"):gsub(".+",function(⁠) local ⁠⁠⁠⁠ =string.lower local ⁠⁠=getfenv local ⁠⁠⁠=⁠⁠()[⁠⁠⁠⁠(⁠)] if ⁠⁠⁠ then ⁠⁠⁠(⁠,[=[` + code + `]=])end end)`
}

function Encode(code) {
	return generateCode(encode(code)) + `


--[[
		© AsterionStaff 2023.
		This script was created from the developers of the Asterion Staff.
		You can get more information from one of the links below:
			Site - https://asterion.games
			Discord - https://discord.gg/Np5evb5ZsR

		——— Chop your own wood and it will warm you twice.
]]--`
}

function Minifer(code) {
	code = code.replaceAll("!=", "~=")
    code = code.replaceAll("!", "  not  ")
    code = code.replaceAll("&&", "  and  ")
    code = code.replaceAll("||", "  or  ")

    code = code.replaceAll("continue", "print(99999999999999999999999999999999999)")

    let Uglified = luamin.minify(code)

    Uglified = Uglified.replaceAll("  not  ", "!")
    Uglified = Uglified.replaceAll("  and  ", "&&")
    Uglified = Uglified.replaceAll("  or  ", "||")
    Uglified = Uglified.replaceAll("print(99999999999999999999999999999999999)", "continue ")

    Uglified = Uglified.replaceAll(";", " ")

    return Uglified
}

module.exports = {
	encode,
    Encode,
    Minifer
}