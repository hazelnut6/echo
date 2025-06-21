const { Router } = require('express');
const userController = require('../controllers/userController');


const userRouter = Router();

userRouter.get('/', userController.getHome);
userRouter.get('/about', userController.getAbout);
userRouter.get('/contact', userController.getContact);


module.exports = userRouter;