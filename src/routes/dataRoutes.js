const express = require('express');
const controller = require('../controllers/dataController');
const cartController = require('../controllers/dataController');
const {verifyToken} = require('../middlewares/authMiddleware');
const router = express.Router();


// Data routes
router.post('/carousel', controller.carouselAdd);
router.post('/courses', controller.coursesAdd);
router.get('/courses/latest', controller.getLastCoursesController);
router.get('/courses/title/:title', controller.getCoursesByTitleController);
router.get('/images/latest', controller.getLastImagesController);
// Cart routes
router.post('/cart/add', verifyToken, cartController.addToCartController);
router.get('/cart', verifyToken, cartController.getCartController);
router.post('/cart/remove', verifyToken, cartController.removeFromCartController);
router.delete('/cart/clear', verifyToken, cartController.clearCartController);

module.exports = router;
