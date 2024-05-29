import { Router } from "express"; // Importing the Router class from express
import { client, productsCollection, usersCollection } from "./database.mjs"; // Importing database client and collections
import { ObjectId } from "mongodb"; // Importing ObjectId to handle MongoDB Object IDs
const router = Router(); // Creating a new router instance

// GET request to fetch all products
router.get("/", async (req, res, next) => {
  try {
    const products = await productsCollection.find().toArray(); // Fetch all products from the productsCollection
    // console.log(products); // Uncomment for debugging
    res.status(200).send(products); // Send the products as response with status 200
  } catch (error) {
    next(error); // Pass any errors to the error-handling middleware
  }
});

// GET request to fetch a single product by ID
router.get("/:_id", async (req, res, next) => {
  try {
    const product = await productsCollection.findOne({
      _id: new ObjectId(req.params._id), // Convert the _id parameter to ObjectId
    });
    // console.log(product); // Uncomment for debugging
    res.status(200).send(product); // Send the product as response with status 200
  } catch (error) {
    next(error); // Pass any errors to the error-handling middleware
  }
});

// POST request to create a new product
router.post("/", async (req, res, next) => {
  const session = client.startSession(); // Start a new session for transaction

  try {
    session.startTransaction(); // Start the transaction

    const data = req.body; // Get the data from the request body
    const insertedProduct = await productsCollection.insertOne(data, {
      session, // Pass the session to the insert operation
    });
    await usersCollection.updateOne(
      { _id: new ObjectId(data.owner) }, // Find the user by owner ID
      { $push: { products: insertedProduct.insertedId } }, // Add the new product ID to the user's products array
      { session } // Pass the session to the update operation
    );
    data["_id"] = insertedProduct.insertedId; // Add the inserted ID to the data object
    await session.commitTransaction(); // Commit the transaction
    res.status(201).send(data); // Send the new product data as response with status 201
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction in case of error
    next(error); // Pass the error to the error-handling middleware
  } finally {
    await session.endSession(); // End the session
  }
});

// DELETE request to delete a product by ID
router.delete("/:_id", async (req, res, next) => {
  try {
    const deleted = await productsCollection.deleteOne({
      _id: new ObjectId(req.params._id), // Convert the _id parameter to ObjectId
    });
    if (!deleted.deletedCount) throw new Error("Could not delete."); // Throw error if no document was deleted
    res.status(200).send("Deleted"); // Send a success message with status 200
  } catch (error) {
    next(error); // Pass any errors to the error-handling middleware
  }
});

export default router; // Export the router as default
