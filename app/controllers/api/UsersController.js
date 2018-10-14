const User = require('../../models/User');
const authService = require('../../services/auth.service');
const bcryptService = require('../../services/bcrypt.service');
const protocolService = require('../../services/protocol.service');

const processError = (err, req, res) => {

  console.error("UsersController error:", {error:err});

  // Codes for MySQL and PostreSQL
  if(err.original.code === 'ER_DUP_ENTRY' || err.original.code === '23505') {
    const { body } = req;
    return protocolService.createErrorResponse(res, 500, `User with username: "${body.username}" already exists.`);
  }
  return protocolService.createErrorResponse(res, 500, 'Internal server error');
};

const issueToken = (user) => {
  return authService.issue({ 
    id: user.id,
    username: user.username
  });
};

const UsersController = () => {
  const register = (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
      return protocolService.createErrorResponse(res, 400, 'Bad Request: Provide username and password.');
    }

    const data = {
      username,
      password
    };
    // TODO: data check

    return User
    .create(data)
    .then((user) => {
      const token = issueToken(user);
      return res.status(200).json({
        token,
        user
      });
    })
    .catch((err) => processError(err, req, res));
  };

  const login = (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
      return protocolService.createErrorResponse(res, 400, 'Bad Request: Provide username and password.');
    }

    if(!!username && !!password) {

      const userFindOptions = { username };

      User
      .findOne({ where: userFindOptions })
      .then((user) => {
        if(!user) {
          return protocolService.createErrorResponse(res, 400, 'Bad Request: User not found.');
        }

        // If user found, compare passwords
        if(bcryptService.comparePassword(password, user.password)){
          const token = issueToken(user);
          return res.status(200).json({
            token,
            user
          });
        }

        return protocolService.createErrorResponse(res, 401, 'Unauthorized');
      })
      .catch((err) => processError(err, req, res));
    }
  };

  const validate = (req, res) => {
    const { token } = req;

    authService
    .verify(token, (err) => {
      if(err){
        return protocolService.createErrorResponse(res, 401, 'Invalid Token!');
      }
      return res.status(200).json({ isvalid: true });
    });
  };

  return {
    register,
    login,
    validate
  };
};

module.exports = UsersController;
