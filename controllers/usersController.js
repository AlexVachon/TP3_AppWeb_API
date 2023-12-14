const User = require("../models/user");
const Voiture = require("../models/voiture");
const config = require("../config");
const url_base = config.URL;

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

    res.status(200).json(filteredUsers);
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
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
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "userId non spécifié dans la requête" });
    }

    const user = await checkUserExists(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { email, username, price } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        username: username,
        email: email,
        price: price,
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
    const user = await User.findById(userId);
    const hasCar = user.voiture ? true : false;

    if (hasCar) {
      const voiture = await Voiture.findOneAndUpdate(
        { _id: user.voiture },
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
          valet: valet,
          updateAt: Date.now(),
        },
        { new: true }
      );
      return res
        .status(201)
        .json({ message: "Voiture modifiée avec succès!", voiture });
    } else {
      const new_voiture = new Voiture({
        marque: marque,
        modele: modele,
        couleur: couleur,
        plaque: plaque,
        latitude: latitude,
        longitude: longitude,
        isParked: isParked,
        isMoving: isMoving,
        timeToLeave: timeToLeave,
        valet: valet,
      });

      await new_voiture.save();
      await user.updateOne({ voiture: new_voiture._id });

      return res
        .status(201)
        .json({ message: "Voiture ajoutée avec succès!", new_voiture });
    }
  } catch (error) {
    hasValidationErrors(res, error);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await checkUserExists(userId);

    if (user.voiture) {
      const voiture = await Voiture.findById(user.voiture);
      await voiture.remove();
    }

    await user.remove();

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Fonction pour vérifier si un utilisateur existe
async function checkUserExists(userId) {
  const user = await User.findById(userId).populate({ path: "voiture" });
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
