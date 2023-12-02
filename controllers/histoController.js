const Histo = require("../models/historique");
const Facture = require("../models/facture");

exports.getHistorique = async (req, res, next) => {
  const userId = req.user.id;
  console.log("userId", userId);
  try {
    const histo = await Histo.find({ userId: userId }).sort({ createdAt: -1 });

    res.status(201).json(histo);
  } catch (err) {
    next(err);
  }
};

exports.effectuerPaiement = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const historiques = await Histo.find({userId: userId, isPaid: false});
    let total = 0

    if (historiques.length === 0) {
      return res.status(201).json({ message: "Aucune facture à payer pour le moment." });
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

    return res.status(201).json({ message: "Paiement effectué avec succès!" });
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
