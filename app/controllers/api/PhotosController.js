const Photo = require('../../models/Photo');

const processError = (err, req, res) => {
  //...
  return res.status(500).json({ msg: 'Internal server error' });
};

const PhotosController = () => {

  const uploadPhoto = (req, res) => {
    const { token } = req.body;
    //...
  };

  return {
    uploadPhoto
  };
};

module.exports = PhotosController;