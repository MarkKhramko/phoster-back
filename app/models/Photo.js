const Sequelize = require('sequelize');
const sequelize = require('../../config/database');

// Reference models
const User = require('./User');

const hooks = {
  beforeCreate(photo) {
    //,,,
  },
};

const tableName = 'photos';

const Photo = sequelize.define('Photo', {
  id:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull:false
  },
  url:{
    type: Sequelize.STRING,
    allowNull:false
  },
  sender:{
    type: Sequelize.INTEGER,
    allowNull:false,
    references:{
      model: User,
      key: 'id'
    }
  },
  receiver:{
    type: Sequelize.INTEGER,
    allowNull:true,
    references:{
      model: User,
      key: 'id'
    }
  },
  latitude:{
    type: Sequelize.REAL,
    allowNull:true
  },
  longitude:{
    type: Sequelize.REAL,
    allowNull:true
  }
}, { hooks, tableName });

module.exports = Photo;
