const Sequelize = require('sequelize');
const sequelize = require('../../config/database');

const bcryptSevice = require('../services/bcrypt.service');

const hooks = {
  beforeCreate(user) {
    user.password = bcryptSevice.password(user);
  },
};

const tableName = 'users';

const User = sequelize.define('User', {
  id:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull:false
  },
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull:false
  },
  password: {
    type: Sequelize.STRING,
    allowNull:false
  },
}, { hooks, tableName });

User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;