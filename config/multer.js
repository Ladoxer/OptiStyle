const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,path.join(__dirname,'../public/adminAsset/productImages'));
  },

  filename:(req,file,cb)=>{
    const name = Date.now()+'-'+file.originalname;
    cb(null,name);
  }
});

const imageFilter = (req,file,cb)=>{
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
    req.fileValidationError = 'Only images files are allowed!';
    return cb(new Error('only image files are allowed!'),false);
  }
  cb(null,true);
}
const upload = multer({storage:storage,imageFilter});

module.exports = {
  upload,
}