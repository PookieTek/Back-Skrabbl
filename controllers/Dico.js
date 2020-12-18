const Utils = require('../utils/word');

exports.checkWord = (req, res) => {
    console.log(req.body);
    if (!req.body.word) {
        return res.status(401).json({error: "params missing"})
    }
    const def = Utils.SearchWord("velo");
    console.log(def);
    return res.status(200).json(def);
}