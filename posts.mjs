import { Router } from "express"; // Importing the Router class from express
import { client, postsCollection, usersCollection } from "./database.mjs"; // Importing database client and collections
import { ObjectId } from "mongodb"; // Importing ObjectId to handle MongoDB Object IDs

const router = Router(); // Creating a new router instance

/**
 * GET /:_id
 * Route to fetch posts visible to a specific user by ID.
 * 
 * @param {string} _id - The ID of the requesting user.
 * @returns {Array} - List of posts visible to the user.
 */
router.get("/:_id", async (req, res, next) => {
  try {
    const requestingUserId = new ObjectId(req.params._id); // Convert the _id parameter to ObjectId

    const requestingUser = await usersCollection.findOne(
      { _id: requestingUserId },
      { projection: { freinds: 1 } } // Only retrieve the friends field
    );

    if (!requestingUser) {
      return res.status(404).send("User not found"); // Return 404 if user not found
    }

    // Query for posts visible to the user
    const query = {
      $or: [
        { privacy: "public" }, // Public posts
        { owner: requestingUserId }, // Posts owned by the user
        { privacy: "private", owner: { $in: requestingUser.freinds } }, // Private posts from friends
      ],
    };

    const posts = await postsCollection.find(query).toArray(); // Fetch the posts based on the query

    res.status(200).json(posts); // Send the posts as JSON response with status 200
  } catch (error) {
    next(error); // Pass any errors to the error-handling middleware
  }
});

/**
 * GET /mypost/:_id
 * Route to fetch all posts owned by a specific user.
 * 
 * @param {string} _id - The ID of the user whose posts are being fetched.
 * @returns {Array} - List of posts owned by the user.
 */
router.get("/mypost/:_id", async (req, res, next) => {
  try {
    const userPosts = await postsCollection
      .find({
        owner: req.params._id, // Find posts where the owner matches the ID parameter
      })
      .toArray();
    res.status(200).send(userPosts); // Send the user's posts as response with status 200
  } catch (error) {
    next(error); // Pass any errors to the error-handling middleware
  }
});

/**
 * POST /
 * Route to create a new post.
 * 
 * @param {object} req.body - The data for the new post.
 * @returns {object} - The created post object.
 */
router.post("/", async (req, res, next) => {
  const session = client.startSession(); // Start a new session for transaction

  try {
    session.startTransaction(); // Start the transaction

    const data = req.body; // Get the data from the request body
    const currentTime = new Date();
    data["createdAt"] = currentTime; // Set the createdAt timestamp
    const insertedPost = await postsCollection.insertOne(data, { session }); // Insert the new post into the postsCollection within the session
    await usersCollection.updateOne(
      { _id: new ObjectId(data.owner) }, // Find the user by owner ID
      { $push: { posts: insertedPost.insertedId } }, // Add the new post ID to the user's posts array
      { session } // Pass the session to the update operation
    );
    data["_id"] = insertedPost.insertedId; // Add the inserted ID to the data object
    await session.commitTransaction(); // Commit the transaction
    res.status(201).send(data); // Send the new post data as response with status 201
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction in case of error
    next(error); // Pass the error to the error-handling middleware
  } finally {
    await session.endSession(); // End the session
  }
});

/**
 * DELETE /:_id
 * Route to delete a post by ID.
 * 
 * @param {string} _id - The ID of the post to be deleted.
 * @returns {string} - Success message if deleted.
 */
router.delete("/:_id", async (req, res, next) => {
  const session = client.startSession(); // Start a new session for transaction

  try {
    session.startTransaction(); // Start the transaction

    const postToDelete = await postsCollection.findOne({
      _id: new ObjectId(req.params._id), // Convert the _id parameter to ObjectId
    });

    if (!postToDelete) throw new Error("Could not find post."); // Throw error if the post is not found

    const deleted = await postsCollection.deleteOne(
      { _id: new ObjectId(req.params._id) }, // Delete the post by its ID
      { session } // Pass the session to the delete operation
    );
    if (!deleted.deletedCount) throw new Error("Could not delete."); // Throw error if no document was deleted
    await usersCollection.updateOne(
      { _id: postToDelete.owner }, // Find the user by owner ID
      { $pull: { posts: postToDelete._id } }, // Remove the post ID from the user's posts array
      { session } // Pass the session to the update operation
    );
    await session.commitTransaction(); // Commit the transaction
    res.status(200).send("Deleted"); // Send a success message with status 200
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction in case of error
    next(error); // Pass the error to the error-handling middleware
  } finally {
    await session.endSession(); // End the session
  }
});

export default router; // Export the router as default
