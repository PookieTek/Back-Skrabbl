const Room = require ('../models/game');
const Player = require('../models/players');
const jwt = require('jsonwebtoken');
const Utils = require('../utils/word');

exports.createRoom = async(req, res, next) => {
    const tmpBoard = new Room;
    for (var y = 0; y < 15; y++) {
        for (var x = 0; x < 15; x++) {
            wm = Utils.getBonusWord(x, y);
            lm = Utils.getBonusLetter(x, y);
            tmpBoard.board.push({
                empty: true,
                x: x,
                y: y,
                value: "",
                joker: false,
                wordMultiple: wm,
                letterMultiple: lm,
                dictionnary: "fr",
            })
        }
    }
    const result = await Room.create({
        board: tmpBoard.board,
        pool: "??EEEEEEEEEEEEEEEAAAAAAAAAIIIIIIIINNNNNNOOOOOORRRRRRSSSSSSTTTTTTUUUUUULLLLLDDDMMMGGBBCCPPFFHHVVJQKWXYZ",
    });
    if (!result)
        return res.status(401).json({error: "Fail Create Room"})
    return res.status(200).json(result)
}

exports.configRoom = async(req, res, next) => {
    if (!req.body.duration)
        return res.status(401).json({error: "invalid configuration"})
    const result = await Room.updateOne({linkId: res.locals.room}, {
        $set: {
            turn_duration: req.body.duration,
            dictionnary: (req.body.dico ? req.body.dico : "fr")
        }
    })
    if (!result)
        return res.status(401).json({error: "Error edit"})
    return res.status(200).json({message: "OK"})
}

exports.joinRoom = async(req, res, next) => {
    const room = await Room.findOne({linkId: res.locals.room})
    console.log(res.locals)
    if (!room)
        return res.status(401).json({error: "no room found"})
    if (room.players.indexOf(res.locals.user) == -1)
        return res.status(401).json({error: "not part of the room"})
    return res.status(200).json({message: "ok"})
}

exports.addPlayer = async(req, res, next) => {
    if (!req.body.pseudo || !req.body.avatar || !req.body.id)
        return res.status(401).json({error: "Missing Params"})
    var own = false;
    const room = await Room.findOne({linkId: req.body.id})
    if (!room)
        return res.status(401).json({error: "No room found"})
    if (!room.players || room.players.length === 0)
        own = true
    else if (room.players.length === 4)
        return res.status(401).json({error: "Max Players"})
    const pl = await Player.create({
        pseudo: req.body.pseudo,
        avatar: req.body.avatar,
        score: 0,
        owner: own,
    })
    if (!pl)
        return res.status(401).json({error: "failed create player"})
    const result = await Room.updateOne({linkId: req.body.id}, {
        $push: {players: pl._id}
    })
    if (!result)
        return res.status(401).json({error: "Failed to insert player"})
    return res.status(200).json({pl, token: jwt.sign(
        {
            playerId: pl._id,
            roomId: req.body.id
        },
        'RANDOM_TOKEN_SECRET',
        {expiresIn: '24h'}
    )})
}

exports.removePlayer = async(req, res, next) => {
    var pl = await Player.findOneAndDelete({_id: res.locals.user});
    if (!pl)
        return res.status(401).json({error: "fail to delete player"})
    var result = await Room.findOneAndUpdate({linkId: res.locals.room}, {
        $pull: {players: pl._id},
    })
    if (!result)
        return res.status(401).json({error: "fail to remove player"})
    if (result.players.length > 0 && pl.owner)
        result = await Player.updateOne({_id: result.players[1]}, {
            owner: true
        })
    else {
        var datadel = await Room.findOneAndDelete({linkId: res.locals.room})
        datadel.players.forEach(element => {
            Player.findOneAndDelete({id: element._id})
        });
    }
    return res.status(200).json({message: "OK"})
}

exports.getRoom = async(req, res, next) => {
    const result = await Room.findOne({linkId: res.locals.room}).populate("players").populate("turn").exec()
    if (!result)
        return res.status(400).json({message: "no room found"})
    for (var i = 0; i < result.players.length; i++) {
        if (result.players[i]._id != res.locals.user) {
            result.players[i].hand = ""
        }
    }
    return res.status(200).json(result)
}

exports.startGame = async(req, res, next) => {
    var game = await Room.findOne({linkId: res.locals.room}).populate('players').exec()
    if (!game)
        return res.status(401).json({error: "No room found"})
    if (!game.joinable)
        return res.status(401).json({error: "Game already started"})
    var check = false;
    for (var i = 0; i < game.players.length; i++) {
        if (game.players[i]._id == res.locals.user && game.players[i].owner)
            check = true;
    }
    if (!check)
        return res.status(401).json({error: "unauthorize"});
    if (game.players.length < 2)
        return res.status(401).json({error: "not enough players"})
    if (game.dictionnary === "fr")
        game.pool = "??EEEEEEEEEEEEEEEAAAAAAAAAIIIIIIIINNNNNNOOOOOORRRRRRSSSSSSTTTTTTUUUUUULLLLLDDDMMMGGBBCCPPFFHHVVJQKWXYZ";
    else
        game.pool = "??EEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOORRRRRRNNNNNNTTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ";
    for (var i = 0; i < game.players.length; i++) {
        var hand = "";
        for (var j = 0; j < 7; j++) {
            var ind = Math.floor(Math.random() * Math.floor(game.pool.length))
            hand += game.pool.charAt(ind);
            game.pool = game.pool.substring(0, ind) + game.pool.substring(ind + 1, game.pool.length)
        }
        await Player.updateOne({_id: game.players[i]._id}, {
            $set: {
                hand: hand,
                score: 0,
            }
        });
    }
    const gam = await Room.findByIdAndUpdate({_id: game._id}, {
        $set: {
            pool: game.pool,
            joinable: false,
            turn: game.players[0].id,
        }
    }, {new: true})
    return res.status(200).json(gam);
}

exports.getDefinition = async(req, res, next) => {
    if (!req.body.x || !req.body.y)
        return res.status(401).json({err: "params missing"});
    const game = await Room.findOne({linkId: res.locals.room})
    if (!game)
        return res.status(401).json({err: "No Room Found"})
    const def = await Utils.GetDefinition(game.board, game.dictionnary, req.body.x, req.body.y)
    return res.status(200).json(def)
}