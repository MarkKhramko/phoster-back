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
    const photoWithoutReceiver = await Photo.findOneWithoutReceiver(photoData.senderId);

    let receiverId = null;
    if(photoWithoutReceiver){
      receiverId = photoWithoutReceiver.senderId;

      const findOptions = { id:photoWithoutReceiver.id };
      await Photo.update({receiverId:photoData.senderId},{where:findOptions});
    }

    const finalData = {
      ...photoData,
      receiverId
    };

    const savedPhoto = await Photo.create(finalData);
    return Promise.resolve([savedPhoto, photoWithoutReceiver]);
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
        case 'latitude':
          // TODO: value check
          photoData.latitude = value;
          break;
        case 'longitude':
          // TODO: value check
          photoData.longitude = value;
          break;
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
          .then(([userPhoto, encounterPhoto])=>{

            return res.status(200).json({
              userPhoto,
              encounterPhoto
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
    .then((photos) => {
      return res.status(200).json({
        photos
      });
    })
    .catch((err )=> processError(err, req, res));
  };

  const like = (req, res) => {
    const { token, body } = req;

    const photoId = body.photoId;
    const isLiked = !!body.isLiked;

    if(isNaN(photoId)){
      return processError("Wrong ID", req, res);
    }
    //TODO: proper data check

    const photoFindOptions = {
      id: photoId
    };
    Photo.update({isLiked:isLiked},{where:photoFindOptions})
    .then((photo) => {
      return res.status(200).json({
        isLiked
      });
    })
    .catch(err => processError(err, req, res))
  }

  return {
    upload,
    get,
    like
  };
};

module.exports = PhotosController;