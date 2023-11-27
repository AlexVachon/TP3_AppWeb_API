const express = require('express');
const mongoose = require('mongoose');
var hateoasLinker = require('express-hateoas-links');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const historiqueRoutes = require('./routes/historique');
const config = require('./config');

const app = express();
const PORT = config.PORT;
const MONGO_URL = config.MONGO_URL

// parse application/json
app.use(express.json());  

// remplace le res.json standard avec la nouvelle version
// qui prend en charge les liens HATEOAS
app.use(hateoasLinker); 

// Utilisation des routes en tant que middleware
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API !');
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/auth', authRoutes);
app.use(userRoutes);
app.use(historiqueRoutes);

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  if(err.name !== "ValidationError"){
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
});





mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log('Node.js est à l\'écoute sur le port %s ', PORT);
    });
  })
  .catch(err => console.log(err));

