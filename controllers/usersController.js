const User = require("../models/user");
const Voiture = require("../models/voiture");
const Histo = require("../models/historique");
const config = require("../config");
const url_base = config.URL + ":" + config.PORT;

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isValet: false }).populate({
      path: "voiture",
      match: { isParked: true },
    });

    const filteredUsers = users.filter((user) => user.voiture != null);
    if (!filteredUsers) {
      const error = new Error("Aucun utilisateur trouvé.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      users: filteredUsers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.query.userId
    const user = await checkUserExists(userId);

    const userResource = {
      user: {
        data: user,
        links: {
          self: {
            href: url_base + req.url,
            method: "GET",
            title: "Utilisateur connecté",
          },
          delete: {
            href: url_base + req.url,
            method: "DELETE",
            title: "Supprimer l'utilisateur",
          },
        },
      },
    };

    return res.status(200).json(userResource);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const {userId} = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId non spécifié dans la requête' });
    }

    const user = await checkUserExists(userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};


exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { email, username } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        username: username,
        email: email,
      },
      { new: true }
    );
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    else return res.status(200).json({ message: "Modifié avec succès!" });
  } catch (error) {
    hasValidationErrors(res, error);
    next(error);
  }
};

exports.updateCar = async (req, res, next) => {
  try {
    const {
      marque,
      modele,
      couleur,
      plaque,
      latitude,
      longitude,
      isParked,
      isMoving,
      timeToLeave,
      valet,
    } = req.body;
    const { userId } = req.params;
    const voiture = await Voiture.findOneAndUpdate(
      await User.findById(userId).voiture,
      {
        marque: marque,
        modele: modele,
        couleur: couleur,
        plaque: plaque,
        latitude: latitude,
        longitude: longitude,
        isParked: isParked,
        isMoving: isMoving,
        timeToLeave: timeToLeave,
        valet: valet
      },
      { new: true }
    );
    if (!voiture)
      return res.status(404).json({ message: "Voiture non trouvé." });
    else
      return res.status(200).json({ message: "Voiture modifié avec succès!" });
  } catch (error) {
    hasValidationErrors(res, error);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const user = await checkUserExists(userId);
    await user.remove();
    if (user.voiture) {
      const voiture = await Voiture.findById(user.voiture);
      await voiture.remove();
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Fonction pour vérifier si un utilisateur existe
async function checkUserExists(userId) {
  const user = await User.findById(userId).populate({path: "voiture"});
  if (!user) {
    const error = new Error("L'utilisateur n'existe pas.");
    error.statusCode = 404;
    throw error;
  }
  return user;
}

//Erreur de validation
function hasValidationErrors(res, error) {
  if (error.name === "ValidationError") {
    const validationErrors = {};

    for (const key in error.errors) {
      validationErrors[key] = error.errors[key].message;
    }

    return res.status(400).json({ errors: validationErrors });
  }
}
