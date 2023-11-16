const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voitureSchema = new Schema(
  {
    marque: {
      type: String,
      required: [true, "Requis"],
      validate: {
        validator: function(v){
          return /^[A-Za-z]{1,50}$/.test(v.trim())
        },
        message: "La marque doit contenir entre 1 et 50 caractères"
      }
    },
    modele: {
      type: String,
      required: [true, "Requis"],
      validate: {
        validator: function(v){
          return /^[A-Za-z]{1,50}$/.test(v.trim())
        },
        message: "Le modèle doit contenir entre 1 et 50 caractères"
      }
    },
    couleur: {
      type: String,
      required: [true, "Requis"],
      validate: {
        validator: function(v){
          return /^[A-Za-z]{3,50}$/.test(v.trim())
        },
        message: "La couleur doit contenir entre 3 et 50 caractères"
      }
    },
    plaque: {
      type: String,
      required: [true, "Requis"],
      length: [6, "Doit contenir 6 caractères"]
    },
    valet: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    isParked: {
      type: Boolean,
    },
    isMoving: {
      type: Boolean,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    timeToLeave: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voiture', voitureSchema);
