const User = require("../models/user")
const Voiture = require("../models/voiture")
const Facture = require("../models/facture")
const Historique = require("../models/historique")

const bcrypt = require("bcryptjs");

const users = require("../seeds/users")
const voitures = require("../seeds/voitures")
const factures = require("../seeds/factures")
const historiques = require("../seeds/historiques")

exports.seed = async (req, res, next) => {
    const result = {};
  
    try {
      console.log("Deleting all documents...")
      await Promise.all([
        Facture.deleteMany(),
        Historique.deleteMany(),
        Voiture.deleteMany(),
        User.deleteMany()
      ]);
      console.log("Creating documents")
      const [usersInsert, voituresInsert, facturesInsert, historiquesInsert] = await Promise.all([
        User.insertMany(users),
        Voiture.insertMany(voitures),
        Facture.insertMany(factures),
        Historique.insertMany(historiques),
      ]);
      console.log("Done with task!")
      if (usersInsert.length > 0) {
        result.users = usersInsert;
      }
  
      if (voituresInsert.length > 0) {
        result.voitures = voituresInsert;
      }
  
      if (facturesInsert.length > 0) {
        result.factures = facturesInsert;
      }
  
      if (historiquesInsert.length > 0) {
        result.historiques = historiquesInsert;
      }
  
      res.status(200).json(result);
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };