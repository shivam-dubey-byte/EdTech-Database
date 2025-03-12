const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const connectDB = require('../connectDB');
const { console } = require('inspector');

const addCarousel = async (image, url) => {
  const db = await connectDB("userdata");
  const collection = db.collection('images');
  const imageData = { image, url };
  const result = await collection.insertOne(imageData);
  return result.insertedId;
};

const addCourses = async (title, image, url) => {
  const db = await connectDB("userdata");
  const collection = db.collection('courses');
  const coursesData = { title, image, url };
  const result = await collection.insertOne(coursesData);
  return result.insertedId;
};

// Retrieve the last 6 inserted courses
const getLastCourses = async () => {
  const db = await connectDB("userdata");
  const collection = db.collection('courses');
  // Sort descending by _id (newest first) and limit to 6 documents
  const courses = await collection.find({}, { projection: { title: 1, image: 1,price:1, _id: 0 } })
    .sort({ _id: -1 })
    .limit(6)
    .toArray();
  return courses;
};

// Retrieve courses by a specific title
const getCoursesByTitle = async (title) => {
  const db = await connectDB("userdata");
  const collection = db.collection('courses');
  // This query is case sensitive; adjust if needed (e.g., using a regex for case-insensitive search)
  const courses = await collection.find({ title }).toArray();
  return courses;
};

// Retrieve the last 5 images from the images collection
const getLastImages = async () => {
  const db = await connectDB("userdata");
  const collection = db.collection('images');
  // Sort descending by _id (newest first) and limit to 5 documents
  const images = await collection.find().sort({ _id: -1 }).limit(5).toArray();
  return images;
};

// Add course to cart
const addToCart = async (email, title, image, price) => {
  const db = await connectDB("userdata");
  const collection = db.collection('carts');

  // Check if the cart exists
  const cart = await collection.findOne({ email });

  if (cart) {
    const existingItem = cart.items.find(item => item.title === title);
    if (existingItem) {
      // Increase quantity if the course already exists
      await collection.updateOne(
        { email, "items.title": title },
        { $inc: { "items.$.quantity": 1 } }
      );
    } else {
      // Add new course to cart
      await collection.updateOne(
        { email },
        { $push: { items: { title, image, price, quantity: 1 } } }
      );
    }
  } else {
    // Create new cart for the user
    await collection.insertOne({
      email,
      items: [{ title, image, price, quantity: 1 }]
    });
  }

  return { message: "Course added to cart" };
};

// Get cart for user
const getCart = async (email) => {
  const db = await connectDB("userdata");
  const collection = db.collection('carts');
  const cart = await collection.findOne({ email });
  return cart ? cart.items : [];
};

// Remove a course from cart using title
const removeFromCart = async (email, title) => {
  const db = await connectDB("userdata");
  const collection = db.collection('carts');

  await collection.updateOne(
    { email },
    { $pull: { items: { title } } }
  );

  return { message: "Course removed from cart" };
};

// Clear entire cart
const clearCart = async (email) => {
  const db = await connectDB("userdata");
  const collection = db.collection('carts');

  await collection.deleteOne({ email });

  return { message: "Cart cleared" };
};

module.exports = {
  addCarousel,
  addCourses,
  getLastCourses,
  getCoursesByTitle,
  getLastImages,
  addToCart,
  getCart,
  removeFromCart,
  clearCart
};
