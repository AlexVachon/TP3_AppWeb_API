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
    if (!filteredUsers.length) {
      const error = new Error("Aucun utilisateur trouvé.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      users: filteredUsers,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await checkUserExists(userId);

    const userResource = {
      user: {
        data: user,
        links: {
          self: {
            href: `/user/`,
            method: "GET",
            title: "Utilisateur connecté",
          },
          delete: {
            href: `/user/`,
            method: "DELETE",
            title: "Supprimer l'utilisateur",
          },
        },
      },
    };

    return res.status(200).json(userResource);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    const user = await checkUserExists(userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
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
    next(err);
  }
};

exports.updateCar = async (req, res, next) => {};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
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
  const user = await User.findById(userId).populate("voiture");
  if (!user) {
    const error = new Error("L'utilisateur n'existe pas.");
    error.statusCode = 404;
    throw error;
  }
  return user;
}
