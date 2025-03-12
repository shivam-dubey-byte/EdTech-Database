const {
  addCarousel,
  addCourses,
  getLastCourses,
  getCoursesByTitle,
  getLastImages,
  addToCart,
  getCart,
  removeFromCart,
  clearCart
} = require('../models/dataModel');


require('dotenv').config();

// --------------------------
// Data (Carousel & Courses) Handlers
// --------------------------

// Add a new carousel image
const carouselAdd = async (req, res) => {
  try {
    const { image, url } = req.body;
    const insertedId = await addCarousel(image, url);
    res.status(201).json({ message: 'Carousel image added', id: insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Add a new course
const coursesAdd = async (req, res) => {
  try {
    const { title, image, url } = req.body;
    const insertedId = await addCourses(title, image, url);
    res.status(201).json({ message: 'Course added', id: insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Retrieve the last 6 inserted courses
const getLastCoursesController = async (req, res) => {
  try {
    const courses = await getLastCourses();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Retrieve courses by a given title (e.g., using a URL parameter)
const getCoursesByTitleController = async (req, res) => {
  try {
    const { title } = req.params; // Pass title as a URL parameter
    const courses = await getCoursesByTitle(title);
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Retrieve the last 5 images from the images collection
const getLastImagesController = async (req, res) => {
  try {
    const images = await getLastImages();
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Add course to cart
const addToCartController = async (req, res) => {
  try {
    const { title, image, price } = req.body;
    const email = req.email; // Extract email from token

    const response = await addToCart(email, title, image, price);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get user cart
const getCartController = async (req, res) => {
  try {
    const email = req.email; // Extract email from token
    const cart = await getCart(email);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Remove a course from cart using title
const removeFromCartController = async (req, res) => {
  try {
    const { title } = req.body;
    const email = req.email; // Extract email from token

    const response = await removeFromCart(email, title);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Clear entire cart
const clearCartController = async (req, res) => {
  try {
    const email = req.email; // Extract email from token
    const response = await clearCart(email);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};



module.exports = {
  carouselAdd,
  coursesAdd,
  getLastCoursesController,
  getCoursesByTitleController,
  getLastImagesController,
  addToCartController,
  getCartController,
  removeFromCartController,
  clearCartController
};
