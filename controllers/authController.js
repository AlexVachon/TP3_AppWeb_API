const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/user");

function createToken(email) {
  return jwt.sign({ email: email }, process.env.SECRET_JWT, {
    expiresIn: "1h",
  });
}

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  // TODO: Ajouter les chemins pour les pages
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Adresse e-mail ou mot de passe incorrect." });
    }
    if (await bcrypt.compare(password, user.password)) {
      if (user.isValet) {
        return res.status(200).json({
          message: "Rediriger vers la page Valet",
          token: createToken(email),
        });
      }
      return res.status(200).json({
        message: "Rediriger vers Ma place",
        token: createToken(email),
      });
    }

    return res
      .status(401)
      .json({ message: "Adresse e-mail ou mot de passe incorrect." });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  const { email, username, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res
        .status(401)
        .json({ message: "Les mots de passe doivent être identiques!" });
    }

    const new_user = User({
      email: email,
      username: username,
      password: password,
    });

    await new_user.save();
    return res.status(200).json({
      message: "Compte créé avec succès!",
      token: createToken(new_user.email),
    });
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      const validationErrors = {};

      for (const key in error.errors) {
        validationErrors[key] = error.errors[key].message;
      }

      return res.status(400).json({ errors: validationErrors });
    } else {
      console.error(error);
      return res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
};
