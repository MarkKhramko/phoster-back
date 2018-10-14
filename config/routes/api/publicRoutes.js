module.exports = {
  'GET /status': 'APIController.getStatus',

  'POST /register': 'UsersController.register',
  'POST /login': 'UsersController.login',
  'POST /validate': 'UsersController.validate',
};
