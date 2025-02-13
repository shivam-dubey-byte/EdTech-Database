const express = require('express');
const controller = require('../controllers/dataController');
const router = express.Router();


// Data routes
router.post('/carousel', controller.carouselAdd);
router.post('/courses', controller.coursesAdd);
router.get('/courses/latest', controller.getLastCoursesController);
router.get('/courses/title/:title', controller.getCoursesByTitleController);
router.get('/images/latest', controller.getLastImagesController);

module.exports = router;
