const express = require('express');
const { type } = require('express/lib/response');
const userControllers = require('../controllers/userController');
const authController = require('../controllers/authController');
const { route } = require('./tourRoutes');

//images are not directly uploaded, we first take them in our system and then put a link to upload them in the database

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);
// console.log(typeof router);
router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser);
//upload middleware puts information about the file in the request object
//the req.file specifies all the deatails related to the file
//the req.body specifies only the text filed
router
  .route('/:id')
  .get(userControllers.getUser)
  .patch(userControllers.updateUser)
  .delete(userControllers.deleteUser);

router.patch('/updateMe', userControllers.updateUsrPhoto);

module.exports = router;
