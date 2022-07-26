const parseNumberFromWAString = require('../utils/parse-wa-number');

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Middleware to handle image if one exists as a part of the message.
 * If image exists -> pass it to Cloudinary -> get link for asset ->
 * attach link to req.body.imageUrl which later will be added to DB
 */

const handleIfImage = (req, res, next) => {
  // checking if message includes a media item
  const hasMediaUrl = req.body.mediaUrl || false;
  if (hasMediaUrl) {
    // assigns file name such as: '+972587400020@2022-07-26T17:09:58.043Z'
    const imageFilename = parseNumberFromWAString(req.body.phoneNumber) + '@' + new Date().toISOString();
    cloudinary.uploader
      .upload(req.body.mediaUrl, {
        resource_type: 'image',
        public_id: imageFilename,
      })
      .then((success) => {
        req.body.imageUrl = success.secure_url;
        next();
      })
      .catch(next);
  } else {
    next();
  }
};

module.exports = handleIfImage;

// cloudinary success response:
// {
//   public_id: 'cr4mxeqx5zb8rlakpfkg',
//   version: 1571218330,
//   signature: '63bfbca643baa9c86b7d2921d776628ac83a1b6e',
//   width: 864,
//   height: 576,
//   format: 'jpg',
//   resource_type: 'image',
//   created_at: '2017-06-26T19:46:03Z',
//   bytes: 120253,
//   type: 'upload',
//   url: 'http://res.cloudinary.com/demo/image/upload/v1571218330/cr4mxeqx5zb8rlakpfkg.jpg',
//   secure_url: 'https://res.cloudinary.com/demo/image/upload/v1571218330/cr4mxeqx5zb8rlakpfkg.jpg'
// }
