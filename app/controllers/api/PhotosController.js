const formidable = require('formidable');
const cloudinary = require('cloudinary');

const Photo = require('../../models/Photo');
const protocolService = require('../../services/protocol.service');

const processError = (err, req, res) => {
  console.error("PhotosController error:", {error:err});
  return protocolService.createErrorResponse(res, 500, 'Internal server error');
};

const PhotosController = () => {

  const uploadPhoto = (req, res) => {
    const { token } = req;

    // Properties, that will be saved in db
    let photoData = {
      sender: token.id,
      receiver: null
    };

    const form = new formidable.IncomingForm();
    form.parse(req);

    form.on('field', function(name, value) {
      switch(name){
        case 'latitude':{
          // TODO: value check
          photoData.latitude = value;
        }
        case 'longitude':{
          // TODO: value check
          photoData.longitude = value;
        }
        default:
          break;
      }
    });

    let filesCount = 0;
    form.on('fileBegin', function (name, file){

      if(filesCount !== 0){
        const msg = `User with id ${token.id} tried to upload multiple files at once`;
        return processError(msg, req, res);
      }

      const fileExt = file.name.split('.').pop();
      if(fileExt === 'jpg' || fileExt === 'png' || fileExt === 'jpeg'){
        filesCount += 1;
      } 
      else {
        const msg = `User with id ${token.id} tried to upload false file type: ${fileExt}`;
        return processError(msg, req, res);
      }
    });

    // Receive file
    // @name - name of the form field
    // @file - properties of the file, including it's original name
    form.on('file', function (name, file){
      const filePath = file.path;
      const fileName = file.name;
      const fileType = file.type;

      cloudinary.v2.uploader.upload(
        filePath,
        {},
        (error, result)=>{
          if(error) 
            return processError(error, req, res);

          const photoURL = result.secure_url;

          photoData.url = photoURL;
          Photo.create(photoData)
          .then((savedPhoto)=>{
            return res.status(200).json({
              url:photoURL
            });
          })
          .catch((err) => { 
            return processError(err, req, res)
          });
        }
      );
    });
  };

  return {
    uploadPhoto
  };
};

module.exports = PhotosController;