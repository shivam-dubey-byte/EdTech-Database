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
  const courses = await collection.find().sort({ _id: -1 }).limit(6).toArray();
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

module.exports = {
  addCarousel,
  addCourses,
  getLastCourses,
  getCoursesByTitle,
  getLastImages
};
