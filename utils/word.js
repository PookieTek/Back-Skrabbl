const { DicoFR, DicoEN } = require('../models/dictionnary');
const { DICOFR_API, DICOEN_API, DICOEN_APP_ID } = require('../config');
const axios = require('axios');

const frenchValue = [
    {V: 'A', S: 1},
    {V: 'B', S: 3},
    {V: 'C', S: 3},
    {V: 'D', S: 2},
    {V: 'E', S: 1},
    {V: 'F', S: 4},
    {V: 'G', S: 2},
    {V: 'H', S: 4},
    {V: 'I', S: 1},
    {V: 'J', S: 8},
    {V: 'K', S: 10},
    {V: 'L', S: 1},
    {V: 'M', S: 2},
    {V: 'N', S: 1},
    {V: 'O', S: 1},
    {V: 'P', S: 3},
    {V: 'Q', S: 8},
    {V: 'R', S: 1},
    {V: 'S', S: 1},
    {V: 'T', S: 1},
    {V: 'U', S: 1},
    {V: 'V', S: 4},
    {V: 'W', S: 10},
    {V: 'X', S: 10},
    {V: 'Y', S: 10},
    {V: 'Z', S: 10},
]

const englishValue = [
    {V: 'A', S: 1},
    {V: 'B', S: 3},
    {V: 'C', S: 3},
    {V: 'D', S: 2},
    {V: 'E', S: 1},
    {V: 'F', S: 4},
    {V: 'G', S: 2},
    {V: 'H', S: 4},
    {V: 'I', S: 1},
    {V: 'J', S: 8},
    {V: 'K', S: 5},
    {V: 'L', S: 1},
    {V: 'M', S: 3},
    {V: 'N', S: 1},
    {V: 'O', S: 1},
    {V: 'P', S: 3},
    {V: 'Q', S: 10},
    {V: 'R', S: 1},
    {V: 'S', S: 1},
    {V: 'T', S: 1},
    {V: 'U', S: 1},
    {V: 'V', S: 4},
    {V: 'W', S: 4},
    {V: 'X', S: 8},
    {V: 'Y', S: 4},
    {V: 'Z', S: 10},
]

const SearchWord = async(word, lang) => {
    if (lang === "fr") {
        const def = await DicoFR.find({word: word});
        console.log(def)
        console.log(word)
        if (def.length == 0) {
            console.log("no def found");
            var result;
            await axios.get(`https://api.dicolink.com/v1/mot/${word}/definitions?limite=200&api_key=${DICOFR_API}`)
            .then(res => {result = res})
            if (result.data.error)
                return null;
            const res = await Dico.create({
                word: word,
                definition: result.data[0].definition
            })
            return res;
        }
        return def;
    } else if (lang === "en") {
        const def = ""; // = await DicoEN.find({word: word});
        console.log(def)
        console.log(word)
        if (def.length == 0) {
            var result;
            await axios.get(`https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${word.toLowerCase()}?fields=definitions&strictMatch=false`, {
                headers: {
                    app_id: DICOEN_APP_ID,
                    app_key: DICOEN_API
                }
            }).then(res => result = res)
            .catch(err => console.log(err))
            if (result.data.error)
                return null;
            const res = await Dico.create({
                word: word,
                definition: result.data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0]
            })
            return res;
        }
        return def;
    }
    return null;
};

const getBonusWord = (x, y) => {
    // x3
    if (x === 0 && (y === 0 || y === 7 || y === 14))
        return 3;
    if (x === 7 && (y === 0 || y === 14))
        return 3;
    if (x === 14 && (y === 0 || y === 7 || y === 14))
        return 3;
    // x2
    if (x === y && (x < 5 || x > 9))
        return 2;
    if (x + y === 14 && (x < 5 || x > 9) && (y < 5 || y > 9))
        return 2;
    return 1;
}

const getBonusLetter = (x, y) => {
    // x3
    if ((x === 1 || x === 5 || x === 9 || x === 13) && (y === 5 || y === 9))
        return 3;
    if ((x === 5 || x === 9) && (y === 1 || y === 13))
        return 3;
    // x2
    if ((x === 3 || x === 11) && (y === 0 || y === 7 || y === 14))
        return 2;
    if ((x === 6 || x === 8) && (y === 2 || y === 6 || y === 8 || y === 12))
        return 2;
    if ((x === 7) && (y === 3 || y === 11))
        return 2;
    if ((x === 0 || x === 14) && (y === 3 || y === 11))
        return 2;
    if ((x === 2 || x === 12) && (y === 6 || y === 8))
        return 2;
    return 1;
}

const CheckBoard = (x, y, board) => {
    var found = board.find(tile => tile.x === x && tile.y === y);
    return found;
}

const writeWord = (board, word) => {
    for (var i = 0; i < word.length; i++) {
        var ind;
        for (var j = 0; j < board.length; j++) {
            if (board[j].x === word[i].x && board[j].y === word[i].y) {
                ind = j
                break;
            }
        }
        board[ind].value = word[i].letter;
        board[ind].empty = false;
        board[ind].joker = word[i].joker;
    }
    return board;
}

const IsBoardEmpty = (board) => {
    return board.every(elem => elem.empty);
}

const GetCol = (board, x, y) => {
    var begin = y;
    var end = y;
    while (begin > 0 && CheckBoard(x, begin, board).empty === false)
        begin--;
    while (end < 15 && CheckBoard(x, end, board).empty === false)
        end++;
    begin++;
    end--;
    var word = {
        x0: x,
        y0: begin,
        x1: x,
        y1: end
    }
    if (begin === end)
        return;
    return word;
}

const GetLine = (board, x, y) => {
    var begin = x;
    var end = x;
    while (begin > 0 && CheckBoard(begin, y, board).empty === false)
        begin--;
    while (end < 14 && CheckBoard(end, y, board).empty === false)
        end++;
    if (end - 1 === begin + 1)
        return;
    return {x0: begin + 1, y0: y, x1 : end - 1, y1: y}
}

const GetWord = (board, word) => {
    var result = "";
    var dir;
    if (word.x0 === word.x1)
        dir = 0;
    else
        dir = 1;
    x = word.x0;
    y = word.y0;
    while (x <= word.x1 && y <= word.y1) {
        var l = CheckBoard(x, y, board).value;
        if (l != undefined)
            result += l;
        if (dir === 0)
            y++;
        else
            x++;
    }
    return result;
}

const IsModified = (elem, word) => {
    var modified = false;
    word.forEach(function(letter) {
        if (elem.x0 <= letter.x && elem.x1 >= letter.x && elem.y0 <= letter.y && elem.y1 >= letter.y)
            modified = true;
    })
    return modified;
}

const GetWordValue = (word, lang) => {
    score = 0;
    for (const l of word) {
    // If French
        if (lang === "fr")
            score += frenchValue.find(el => el.V === l).S
        else
            score += englishValue.find(el => el.v === l).S
    }
    return score;
}

const GetInteraction = (board, word, lang) => {
    var tmpboard = board;
    var wordlist = [];
    tmpboard = writeWord(tmpboard, word);
    word.forEach(function(tile) {
            var c = GetCol(tmpboard, tile.x, tile.y);
            var l = GetLine(tmpboard, tile.x, tile.y);
            if (c) {
                wordlist.push(c)
            }
            if (l) {
                wordlist.push(l)
            }

    })
    var finallist = [];
    wordlist = wordlist.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i)
    wordlist.forEach(function(elem) {
        const w = GetWord(tmpboard, elem);
        finallist.push(w);
    })
    // Check EveryWord
    finallist.forEach(w => {
        if (SearchWord(w, lang) === null)
            return -1;
    })
    // Get Word modified Value
    var score = 0;
    for (var i = 0; i < wordlist.length; i++) {
        if (IsModified(wordlist[i], word))
            score += GetWordValue(finallist[i], lang)
    }
    // Get multiple letter
    word.forEach(function(l) {
        score += (CheckBoard(l.x, l.y, tmpboard).letterMultiple - 1) * GetWordValue(l.letter)
    })
    // Get Multiple word
    word.forEach(function(l) {
        score *= (CheckBoard(l.x, l.y, tmpboard).wordMultiple)
    })
    if (word.length === 7)
        score += 50;
    return score;
}

const GetDefinition = (board, lang, x, y) => {
    var words = [];
    var result = [];
    var c = GetCol(board, x, y)
    if (c)
        words.push(c)
    var l = GetLine(board, x, y)
    if (l)
        words.push(l)
    words = words.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i)
    var final = []
    words.forEach(function(elem) {
        const w = GetWord(board, elem);
        final.push(w);
    })
    final.forEach(w => {
        result.push(SearchWord(w, lang))
    })
    return result;
}

const GetStringValue = (str, lang) => {
    var score = 0
    if (lang === "fr")
        score += frenchValue.find(el => el.V === l).S
    else
        score += englishValue.find(el => el.V === l).S
    return score
}

module.exports = {
    SearchWord,
    CheckBoard,
    getBonusWord,
    getBonusLetter,
    GetInteraction,
    writeWord,
    IsBoardEmpty,
    GetDefinition,
    GetStringValue
}