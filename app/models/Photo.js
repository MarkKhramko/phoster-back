const Sequelize = require('sequelize');
const sequelize = require('../../config/database');
const Op = Sequelize.Op;

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
  senderId:{
    type: Sequelize.INTEGER,
    allowNull:false,
    references:{
      model: User,
      key: 'id'
    }
  },
  receiverId:{
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

module.exports.findOneWithoutReceiver = (senderId)=>{
  const photoFindOptions = {
    senderId: {
      [Op.ne]: senderId
    },
    receiverId: null
  };

  console.log({photoFindOptions});

  return new Promise((resolve, reject)=>{
    Photo.findOne({where:photoFindOptions})
    .then((foundPhoto)=> resolve([null, foundPhoto]))
    .catch(error=> resolve([error]))
  })
};
