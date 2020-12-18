const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const playerId = decoded.playerId;
        const roomId = decoded.roomId;
        if (req.body.playerId && req.body.playerId !== playerId)
            throw 'invalid id';
        else {
            res.locals.user = playerId;
            res.locals.room = roomId;
            next();
        }
    } catch (e) {
        console.log(e)
        res.status(401).json({error: "no authorize"})
    }
}