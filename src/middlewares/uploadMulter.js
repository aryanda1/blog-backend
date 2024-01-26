import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

import s3 from "../utils/s3.js";

const multerUpload = async (request, response, next) => {
  const { email } = request.body;
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new AppError("Not an image! Please upload images only.", 400), false);
    }
  };

  const upload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const fileName = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        cb(null, `images/${fileName}${path.extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
    fileFilter: multerFilter,
  }).single("file");
  upload(request, response, function (error) {
    if (error) {
      console.log(error);
      return response.status(500).json(error);
    } else {
      if (request.file) {
        request.body.email = email;
        next();
      } else response.status(500).json({ message: "File not uploaded" });
    }
  });
};

export default multerUpload;
