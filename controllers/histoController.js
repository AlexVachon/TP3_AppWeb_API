const Histo = require("../models/historique");
const Facture = require("../models/facture");

exports.getHistorique = async (req, res, next) => {
  const userId = req.user.id;
  console.log("userId", userId);
  try {
    const histo = await Histo.find({ userId: userId }).sort({ createdAt: -1 });
    
    res.status(201).json({
      histo: histo,
    });
  } catch (err) {
    next(err);
  }
};

exports.effectuerPaiement = async (req, res, next) => {
  const userId = req.user.id;
  const { histoID } = req.body;

  try {
    const histo = await Histo.findById(histoID);
    if (!histo) {
      return res
        .status(404)
        .json({ message: "Aucun historique trouvé avec cet ID." });
    }

    const facture = new Facture({
      userId: userId,
      price: histo.price,
    });

    histo.isPaid = true;
    await histo.save();
    await facture.save();

    return res.status(201).json({ message: "Facture payée!" });
  } catch (error) {
    next(error);
  }
};

exports.getFacture = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const facture = await Facture.find({ userId: userId });

    if (!facture) {
      return res.status(404).json({ message: "Aucune facture à ce jour!" });
    }

    return res.status(201).json(facture);
  } catch (error) {
    next(error);
  }
};
