const formidable = require('formidable');
const cloudinary = require('cloudinary');

const Photo = require('../../models/Photo');
const protocolService = require('../../services/protocol.service');

const NUMBER_OF_PHOTOS_PER_REQUEST = 5;

const processError = (err, req, res) => {
  console.error("PhotosController error:", {error:err});
  return protocolService.createErrorResponse(res, 500, 'Internal server error');
};

const saveUploadedPhoto = async (photoData) => {
  try{
    const [err, photoWithoutReceiver] = await Photo.findOneWithoutReceiver(photoData.senderId);
    console.log({ photoWithoutReceiver });

    let receiverId = null;
    let photoWithoutReceiverURL = null;
    if(photoWithoutReceiver){
      receiverId = photoWithoutReceiver.senderId;
      photoWithoutReceiverURL = photoWithoutReceiver.url;

      const findOptions = { id:photoWithoutReceiver.id };
      await Photo.update({receiverId:photoData.senderId},{where:findOptions});
    }

    const finalData = {
      ...photoData,
      receiverId
    };

    const savedPhoto = await Photo.create(finalData);
    return Promise.resolve([savedPhoto, photoWithoutReceiverURL]);
  }
  catch(err){
    return Promise.reject(err);
  }
};

const PhotosController = () => {

  const upload = (req, res) => {
    const { token } = req;

    // Properties, that will be saved in db
    let photoData = {
      senderId: token.id,
      receiverId: null
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
          saveUploadedPhoto(photoData)
          .then(([savedPhoto, encounterPhotoURL])=>{

            return res.status(200).json({
              userPhotoURL:savedPhoto.url,
              encounterPhotoURL
            });

          })
          .catch((err) => processError(err, req, res));
        }
      );
    });
  };

  const get = (req, res) => {
    const { token, query } = req;

    const userId = token.id;
    const lastPhotoDate = query.last_photo_date;

    //TODO: data check

    Photo.findForFeed(userId, lastPhotoDate)
    .then((photos)=>{
      return res.status(200).json({
        photos
      });
    })
    .catch((err)=> processError(err, req, res));
  };

  return {
    upload,
    get
  };
};

module.exports = PhotosController;