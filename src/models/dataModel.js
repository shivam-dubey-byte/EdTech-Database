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
  const courses = await collection.find({}, { projection: { title: 1, image: 1,price:1, _id: 0} })
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


const purchaseSingleCourse = async (email, course) => {
  const db = await connectDB("userdata");
  const mycoursesCollection = db.collection('mycourses');
  const cartsCollection = db.collection('carts');
  const coursesCollection = db.collection('courses');

  // Fetch the course details from 'courses' collection to get the URL
  const courseDetails = await coursesCollection.findOne({ title: course.title });

  if (!courseDetails) {
    throw new Error("Course not found in database.");
  }

  // Add URL to the course object
  const fullCourse = {
    ...course,
    link: courseDetails.url,  // Adding the URL from database
  };

  // Check if the course already exists in user's purchased courses
  const existingCourse = await mycoursesCollection.findOne({
    email,
    "courses.title": fullCourse.title
  });

  if (!existingCourse) {
    await mycoursesCollection.updateOne(
      { email },
      { $addToSet: { courses: fullCourse } }, // Add course with URL
      { upsert: true }
    );

    // Remove from cart if it exists
    await cartsCollection.updateOne(
      { email },
      { $pull: { items: { title: fullCourse.title } } }
    );
  }

  return {
    alreadyPurchased: !!existingCourse,
    message: existingCourse ?
      "Course already purchased - removed from cart" :
      "Course purchased successfully"
  };
};



//------
const purchaseCart = async (email) => {
  const db = await connectDB("userdata");
  const cartsCollection = db.collection('carts');
  const mycoursesCollection = db.collection('mycourses');
  const coursesCollection = db.collection('courses');

  // Get cart and check if empty
  const cart = await cartsCollection.findOne({ email });
  if (!cart?.items?.length) throw new Error('Cart is empty');

  // Fetch existing purchased courses
  const existingCourses = await mycoursesCollection.findOne({ email });
  const existingTitles = new Set(
    existingCourses?.courses?.map(c => c.title) || []
  );

  // Filter out already purchased courses
  const newCourses = cart.items.filter(
    item => !existingTitles.has(item.title)
  );

  if (newCourses.length > 0) {
    // Fetch URLs for the new courses
    const courseTitles = newCourses.map(c => c.title);
    const coursesWithUrls = await coursesCollection
      .find({ title: { $in: courseTitles } })
      .toArray();

    // Map URLs to new courses
    const updatedCourses = newCourses.map(course => {
      const courseData = coursesWithUrls.find(c => c.title === course.title);
      return {
        ...course,
        link: courseData ? courseData.url : null, // Add URL if found
        purchasedAt: new Date()
      };
    });

    // Add new courses with URLs to mycourses
    await mycoursesCollection.updateOne(
      { email },
      {
        $addToSet: {
          courses: { $each: updatedCourses }
        }
      },
      { upsert: true }
    );
  }

  // Clear cart after purchase
  await cartsCollection.deleteOne({ email });

  return {
    newPurchases: newCourses.length,
    existingCourses: cart.items.length - newCourses.length,
    message: `Purchased ${newCourses.length} new courses, ` +
             `${cart.items.length - newCourses.length} already owned`
  };
};

const getMyCourses = async (email) => {
  const db = await connectDB("userdata");
  const collection = db.collection('mycourses');
  const result = await collection.findOne({ email });
  return result?.courses || [];
};

// Add to wishlist (prevents duplicates)
const addToWishlist = async (email, title, image, price) => {
  const db = await connectDB("userdata");
  const collection = db.collection('wishlists');

  await collection.updateOne(
    { email },
    { $addToSet: { items: { title, image, price } } },
    { upsert: true }
  );

  return { message: "Course added to wishlist" };
};

// Get wishlist for user
const getWishlist = async (email) => {
  const db = await connectDB("userdata");
  const collection = db.collection('wishlists');
  const wishlist = await collection.findOne({ email });
  return wishlist ? wishlist.items : [];
};

// Remove a course from wishlist using title
const removeFromWishlist = async (email, title) => {
  const db = await connectDB("userdata");
  const collection = db.collection('wishlists');

  await collection.updateOne(
    { email },
    { $pull: { items: { title } } }
  );

  return { message: "Course removed from wishlist" };
};

// Clear entire wishlist
const clearWishlist = async (email) => {
  const db = await connectDB("userdata");
  const collection = db.collection('wishlists');

  await collection.deleteOne({ email });

  return { message: "Wishlist cleared" };
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
  clearCart,
  purchaseSingleCourse,
  purchaseCart,
  getMyCourses,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
};
