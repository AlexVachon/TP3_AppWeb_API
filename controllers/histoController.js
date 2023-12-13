const Histo = require("../models/historique");
const Facture = require("../models/facture");
const User = require("../models/user");
const mongoose = require("mongoose");

exports.getHistorique = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const histo = await Histo.find({ userId: userId }).sort({ createdAt: -1 });

    res.status(201).json(histo);
  } catch (err) {
    next(err);
  }
};

exports.createHistorique = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const valetId = req.user.id;

    if(!mongoose.Types.ObjectId.isValid(valetId)){
      return res.status(401).json({message: "Le valetId n'est pas valide!"})
    }
    if(!mongoose.Types.ObjectId.isValid(userId)){
      return res.status(401).json({message: "Le userId n'est pas valide!"})
    }

    const valet = await User.findById(valetId);

    const newHisto = Histo({
      price: valet.price,
      userId: userId,
      valetId: valetId,
    });

    await newHisto.save();

    return res
      .status(201)
      .json({ message: "Facture créée avec succès!", newHisto });
      
  } catch (error) {
    hasValidationErrors(res, error)
    next(error);
  }
};

exports.effectuerPaiement = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const historiques = await Histo.find({ userId: userId, isPaid: false });
    let total = 0;

    if (historiques.length === 0) {
      return res
        .status(201)
        .json({ message: "Aucune facture à payer pour le moment." });
    }

    for (const histo of historiques) {
      total += histo.price;
      histo.isPaid = true;
      await histo.save();
    }

    const facture = Facture({
      userId: userId,
      price: total,
    });

    await facture.save();

    return res.status(201).json({ message: "Paiement effectué avec succès!", facture });
  } catch (error) {
    for (const histo of historiques) {
      histo.isPaid = false;
      await histo.save();
    }

    next(error);
  }
};

exports.getFacture = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const factures = await Facture.find({ userId: userId });

    return res.status(201).json(factures);
  } catch (error) {
    next(error);
  }
};

function hasValidationErrors(res, error) {
  if (error.name === "ValidationError") {
    const validationErrors = {};

    for (const key in error.errors) {
      validationErrors[key] = error.errors[key].message;
    }

    return res.status(400).json({ errors: validationErrors });
  }
}