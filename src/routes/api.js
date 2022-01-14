import express from 'express';
import validate from 'express-validation';
import multer from 'multer';

import * as userController from '../controllers/user/user.controller';
import * as userValidator from '../controllers/user/user.validator';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

//= ===============================
// API routes
//= ===============================
router.get('/profile', userController.profile);
router.get('/images', userController.userImages);
router.get('/images/:id', userController.userImage);
router.post(
  '/images',
  upload.array('images'),
  userController.addImage,
);
router.post(
  '/changePassword',
  validate(userValidator.changePassword),
  userController.changePassword,
);

module.exports = router;
