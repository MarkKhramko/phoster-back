const User = require('../../models/User');
const authService = require('../../services/auth.service');
const bcryptService = require('../../services/bcrypt.service');

const processError = (err, req, res) => {

  console.error("UsersController error:", {error:err});

  // Codes for MySQL and PostreSQL
  if(err.original.code === 'ER_DUP_ENTRY' || err.original.code === '23505') {
    const { body } = req;
    return res.status(500).json({ msg: `User with username: "${body.username}" already exists.` });
  }
  return res.status(500).json({ msg: 'Internal server error' });
};

const issueToken = (userId)=>{
  return authService.issue({ id: userId });
};

const UsersController = () => {
  const register = (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
      return res.status(400).json({ msg: 'Bad Request: Provide username and password.' });
    }

    const data = {
      username,
      password
    };
    // TODO: data check

    return User
    .create(data)
    .then((user) => {
      const token = issueToken(user.id);
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
      return res.status(400).json({ msg: 'Bad Request: Provide username and password.' });
    }

    if(!!username && !!password) {

      const userFindOptions = { username };

      User
      .findOne({ where: userFindOptions })
      .then((user) => {
        if(!user) {
          return res.status(400).json({ msg: 'Bad Request: User not found' });
        }

        // If user found, compare passwords
        if(bcryptService.comparePassword(password, user.password)){
          const token = issueToken(user.id);
          return res.status(200).json({
            token,
            user
          });
        }

        return res.status(401).json({ msg: 'Unauthorized' });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ msg: 'Internal server error' });
      });
    }
  };

  const validate = (req, res) => {
    const { token } = req.body;

    authService
    .verify(token, (err) => {
      if(err) {
        return res.status(401).json({ isvalid: false, err: 'Invalid Token!' });
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
