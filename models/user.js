const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Requis"],
      unique: [true, "Un compte utilise déjà ce courriel!"],
      maxlength: 50,
      validate: {
        validator: function (v) {
          return /.+@.+\..+/.test(v.trim());
        },
        message: "Adresse courriel invalide",
      }
    },
    username: {
      type: String,
      required: [true, "Requis"],
      validate: {
        validator: function (v){
          return /^[A-Za-z0-9]{3,50}$/.test(v.trim());
        },
        message: "Le nom doit contenir de 3 à 50 caractères"
      }
    },
    password: {
      type: String,
      required: [true, "Requis"],
      minlength: [6, "Doit contenir un minimum 6 caractères"]
    },
    isValet: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      default: 0
    },
    voiture: {
      type: Schema.Types.ObjectId,
      ref: 'Voiture',
      default: null
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model('User', userSchema);
