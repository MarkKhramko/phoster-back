const Photo = require('../../models/Photo');
const protocolService = require('../../services/protocol.service');

const processError = (err, req, res) => {
  console.error("PhotosController error:", {error:err});
  return protocolService.createErrorResponse(res, 500, 'Internal server error');
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