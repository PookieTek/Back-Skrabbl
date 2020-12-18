const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { DB_NAME, DB_USER, DB_PASS } = require('./config');
const dicoRoutes = require('./routes/Dico');
const roomRoutes = require('./routes/Room');
const playerRoutes = require('./routes/Players');

const app = express();


mongoose.connect('mongodb://localhost:27017/' + DB_NAME,
  {
    useNewUrlParser: true,
    user: DB_USER,
    pass: DB_PASS,
    useUnifiedTopology: true,
    promiseLibrary: global.Promise,
    useFindAndModify: false    
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});
app.get('/', function(req, res) {
  res.send("Serv Up !");
})
app.use('/api/search', dicoRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/player', playerRoutes);
module.exports = app;
