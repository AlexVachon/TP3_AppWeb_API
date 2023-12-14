const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/user");

function createToken(user) {
  return jwt.sign(
    { id: user._id, isValet: user.isValet },
    config.SECRET_JWT,
    {
      expiresIn: "24h",
    }
  );
}

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Adresse e-mail ou mot de passe incorrect." });
    }
    if (await bcrypt.compare(password, user.password)) {
      return res.status(200).json({
        message: "Connexion réussie!",
        token: createToken(user),
      });
    }

    return res
      .status(401)
      .json({ message: "Adresse e-mail ou mot de passe incorrect." });
  } catch (error) {
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

    const hashedPassword = await bcrypt.hash(password, 10);

    if(await User.findOne({email: email})){
      return res.status(401).json({message: "Ce courriel est déjà utilisé!"})
    }

    const new_user = User({
      email: email,
      username: username,
      password: hashedPassword,
    });

    await new_user.save();
    return res.status(200).json({
      message: "Compte créé avec succès!",
      token: createToken(new_user),
    });
  } catch (error) {
    hasValidationErrors(res, error);
    next(error);
  }
};


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
