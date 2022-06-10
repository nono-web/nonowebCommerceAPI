const jwt = require('jsonwebtoken');

require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authToken = req.cookies.access_token;
  if (!authToken) {
    return res.status(401).json("Vous n'êtes pas authentifié");
  }


jwt.verify(authToken, process.env.JWT_SEC, (err, user) => {
  if (err) res.status(403).json("Le token n'est pas valide !!!");
  req.user = user;
  next();
});
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("Vous n'êtes pas autorisé");
    }
  });
};

const verifyTokenAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("Vous n'êtes pas autorisé");
    }
  });
};

module.exports = { verifyToken, verifyTokenAndAuthorization, verifyTokenAdmin };
