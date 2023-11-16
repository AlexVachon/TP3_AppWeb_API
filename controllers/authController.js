const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user');

exports.login = (req, res, next) => {
  const { email, password } = req.body;


};

exports.signup = (req, res, next) => {
  const { email, username, password, confirmPassword } = req.body;


};

