const Room = require('../models/game');
const Player = require('../models/players');
const Utils = require('../utils/word');

/*
* Params:
* - RoomId / Word / Dir (bool : true = hori false = vert) / OringX OriginY
*   word : {
    char letter
    int x
    int y
    Bool joker
}
*/
exports.play = async(req, res, next) => {
    if (!req.body.word)
        return res.status(401).json({error: "Params Missing"});
    var game = await Room.findOne({linkId: res.locals.room})
    var player = await Player.findOne({_id: res.locals.user});
    if (!game)
        return res.status(401).json({error: "No room found"})
    // Is Player Turn
    if (game.turn != res.locals.user)
        return res.status(401).json({error: "Unauthorize"});
   // Check Player Hand
    var tmpHand = player.hand;
    var word = req.body.word;
    if (Utils.IsBoardEmpty(game.board) && word.find(l => l.x === 7 && l.y === 7) === -1)
        res.status(401).json({error: "bad placement"});
    for (var i = 0; i < req.body.word.length; i++) {
        var ind = tmpHand.indexOf(req.body.word[i].joker ? '?' : req.body.word[i].letter);
        if (ind == -1)
            return res.status(401).json({error: "Unauthorize"});
        tmpHand = tmpHand.substring(0, ind) + tmpHand.substring(ind +1, tmpHand.length);
    }
    if (!word.every(val => val.x === word[0].x) && !word.every(val=> val.y === word[0].y))
        return res.status(401).json({error: "Invalid Position"});
    var validpos = true;
    word.forEach(l => {
        if (Utils.CheckBoard(l.x, l.y, game.board).empty === false)
            validpos = false;
    })
    if (!validpos)
        return res.status(401).json({error: "Invalid Position"});
    var result = Utils.GetInteraction(game.board, word, game.dictionnary);
    if (result === -1)
        return res.status(401).json({error: "Bad word"});
    // Write Score on player
    game.board = Utils.writeWord(game.board, word);
    while (tmpHand.length < 7 && game.pool.length > 0) {
        var ind = Math.floor(Math.random() * Math.floor(game.pool.length))
        tmpHand += game.pool.charAt(ind);
        game.pool = game.pool.substring(0, ind) + game.pool.substring(ind + 1, game.pool.length)
    }
    player.score += result;
    player.hand = tmpHand;
    if (player.hand.length === 0 && game.pool.length === 0) {
        game.players.forEach(pl => {
            if (pl !== player._id) {
                tmpl = Player.findOne({_id: pl})
                player.score += Utils.GetStringValue(game.dictionnary, tmpl.hand)
            }
        })
        game.joinable = true;
        player.save();
        game.save();
        return res.status(201).json({status: "End Game", player})
    }
    player.save();
    // Change turn
    var turn = game.turn;
    var act = game.players.indexOf(turn);
    if (act === game.players.length - 1) {
        act = 0;    
    } else
        act++;
    turn = game.players[act];
    game = await Room.updateOne({_id: game._id}, {
        $set: {
            board: game.board,
            pool: game.pool,
            turn: turn
        }
    }, {new: true})
    return res.status(200).json("ok");
}

exports.getScore = async(req, res, next) => {
    if (!req.body.word)
        return res.status(401).json({error: "Params Missing"});
    var game = await Room.findOne({linkId: req.body.id})
    var player = await Player.findOne({_id: res.local.user});
    if (!game)
        return res.status(401).json({error: "No room found"})
       // Check Player Hand
    var tmpHand = player.hand;
    var word = req.body.word;
    if (Utils.IsBoardEmpty(game.board) && Utils.CheckBoard(0, 0, game.board) === -1)
        res.status(401).json({error: "bad placement"});
    for (var i = 0; i < req.body.word.length; i++) {
        var ind = tmpHand.indexOf(req.body.word[i].joker ? '?' : req.body.word[i].letter);
        if (ind == -1)
            return res.status(401).json({error: "Unauthorize"});
        tmpHand = tmpHand.substring(0, ind) + tmpHand.substring(ind +1, tmpHand.length);
    }
    if (!word.every(val => val.x === word[0].x) && !word.every(val=> val.y === arr[0].y))
        return res.status(401).json({error: "Invalid Position"});
    if (!word.every(val => game.board[Utils.CheckBoard(val.x, val.y, game.board)].empty))
        return res.status(401).json({error: "Invalid Position"});
    var result = Utils.GetInteraction(game.board, word, game.dictionnary);
    if (result === -1)
        return res.status(401).json({error: "Bad word"});
    return res.status(200).json({result});
}