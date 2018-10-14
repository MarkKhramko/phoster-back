const jwt = require('jsonwebtoken');

const secret = !!process.env.JWT_SECRET ? process.env.JWT_SECRET : 'secret';

module.exports = {
  issue: (payload) => jwt.sign(payload, secret, { expiresIn: 10800 }),
  verify: (token, cb) => jwt.verify(token, secret, {}, cb),
};
