const reviewsDao = require("../repository/ReviewsDAO");
const uuid = require("uuid");
const { logger } = require("../util/logger");
const ArgumentError = require("../errors/ArgumentError");

// ==================================================

/**
 * This function takes in the properties of the new review to be Posted to the DB
 *
 * @param {Object} receivedData This is the data regarding the posting of a review
 * @returns the object that is posted
 */
async function createNewReview(receivedData) {
  logger.info("CreateNewReview method called");
  //validate data before posting a new review
  try {
    //create new review
    const review = {
      recipeId: receivedData.recipeId, //recipeId passed from MealDB API
      recipeName: receivedData.recipeName, //recipeName from MealDB API
      reviewId: uuid.v4(),
      author: receivedData.username, //username acquired from JWT
      imageUrl: receivedData.imageUrl, //passed in by user
      rating: receivedData.rating, //passed in by user
      content: receivedData.content, //passed in by user
      createdAt: Date.now(),
      isRecent: 1,
    };
    //create the new post
    const data = await reviewsDao.postReview(review);
    //return the review object to show back
    return data;
  } catch (err) {
    logger.error(err);
    throw Error(err.message);
  }
}

/**
 * Gets reviews belonging to a recipe or author.  Also gets reviews that are ordered by creation time.
 *
 * @param {Object} requestQueryParams Object that may contain String recipeId or String author.
 * May contain Object ExclusiveStartKey and Number Limit.
 * @returns {{items, LastEvaluatedKey}} An Object containing an Array of Review Objects and LastEvaluatedKey.
 * LastEvaluatedKey may be empty.
 * @throws {ArgumentError} If user input is invalid.
 */
async function getReviews(requestQueryParams) {
  logger.info(`ReviewsService.getReviews(${JSON.stringify(requestQueryParams)})`);

  // max limit of 50 is arbitrary
  const MAX_LIMIT = 50;

  const PROPS = {};

  // Adding the Limit property to use in DynamoDB command
  const { Limit } = requestQueryParams;
  if (Limit === undefined) {
    PROPS.Limit = MAX_LIMIT;
  } else if (Limit <= 0 || Limit > MAX_LIMIT) {
    logger.error(`ReviewsService.getReviews: Limit is out of range.  Limit is ${Limit}.`);
    throw new ArgumentError("Argument 'Limit' is outside of allowed range.  Range is 1 to 50.");
  } else {
    PROPS.Limit = Limit;
  }

  let reviewsData;
  // For querying recipeId-createdAt-index
  if (requestQueryParams.recipeId) {
    PROPS.recipeId = requestQueryParams.recipeId;

    if (requestQueryParams.ExclusiveStartKey) {
      const { recipeId, reviewId, createdAt } = requestQueryParams.ExclusiveStartKey;
      if (recipeId && reviewId && createdAt) {
        PROPS.ExclusiveStartKey = { recipeId, reviewId, createdAt };
      } else {
        logger.error(
          `ReviewsService.getReviews: Missing ExclusiveStartKey props for getting reviews by recipe ID.  ` +
            `Need recipeId, reviewId, createdAt, but ExclusiveStartKey is ${JSON.stringify(
              requestQueryParams.ExclusiveStartKey
            )}.`
        );
        throw new ArgumentError(
          "ExclusiveStartKey is missing required properties for querying by recipe ID.  " +
            "It needs recipeId, reviewId, createdAt."
        );
      }
    }

    // For querying author-createdAt-index table
  } else if (requestQueryParams.author) {
    PROPS.author = requestQueryParams.author;

    if (requestQueryParams.ExclusiveStartKey) {
      const { author, createdAt, recipeId, reviewId } = requestQueryParams.ExclusiveStartKey;
      if (author && createdAt && recipeId && reviewId) {
        PROPS.ExclusiveStartKey = { author, createdAt, recipeId, reviewId };
      } else {
        logger.error(
          `ReviewsService.getReviews: Missing ExclusiveStartKey props for getting reviews by author.  ` +
            `Need author, createdAt, recipeId, reviewId, but ExclusiveStartKey is ${JSON.stringify(
              requestQueryParams.ExclusiveStartKey
            )}.`
        );
        throw new ArgumentError(
          "ExclusiveStartKey is missing required properties for querying by author.  " +
            "It needs author, createdAt, recipeId, reviewId."
        );
      }
    }

    // For querying isRecent-createdAt-index
  } else {
    if (requestQueryParams.ExclusiveStartKey) {
      const { recipeId, reviewId, createdAt } = requestQueryParams.ExclusiveStartKey;
      if (recipeId && reviewId && createdAt) {
        PROPS.ExclusiveStartKey = { recipeId, reviewId, isRecent: 1, createdAt };
      } else {
        logger.error(
          `ReviewsService.getReviews: Missing ExclusiveStartKey props for getting recent reviews.  ` +
            `Need recipeId, reviewId, createdAt, but ExclusiveStartKey is ${JSON.stringify(
              requestQueryParams.ExclusiveStartKey
            )}.`
        );
        throw new ArgumentError(
          "ExclusiveStartKey is missing required properties for querying recent reviews.  " +
            "It needs recipeId, reviewId, createdAt."
        );
      }
    }
  }

  reviewsData = await reviewsDao.getReviews(PROPS);

  logger.info(`ReviewsService.getReviews: Returning ${JSON.stringify(reviewsData)}`);
  return reviewsData;
}

/**
 * Delete the Review and return the deleted review item
 * Will consequently delete all the comments attached to the review as well
 *
 * @param {Object} receivedData
 * @returns gets the deleted review and then returns it
 */
async function deleteReview(receivedData) {
  logger.info("ReviewsService.deleteReview called");
  //if there is no recipeId then throw an argument error
  if (!receivedData.recipeId) {
    throw new ArgumentError("Recipe Id must be defined in Request Body");
  }
  try {
    //next check if the user matches the author of the title or not admin
    const item = await reviewsDao.getOneReviewById(receivedData);
    if (!item) {
      throw new Error("No Review has this ID");
    } else if (receivedData.username === item.author || receivedData.isAdmin) {
      //will return the deleted item from the DB or will be caught in try catch
      await reviewsDao.deleteReviewById(receivedData);
      logger.info("Successfully Deleted Review");
      return item;
    } else {
      throw new ArgumentError("Cannot Delete Another Users Post");
    }
  } catch (err) {
    logger.error("Error Deleting Review");
    throw Error(err);
  }
}

/**
 * function gets one review from the DB
 * 
 * @param {Object} receivedData contains the recipeId and the reviewId
 * @returns the review
 */
async function getOneReview(receivedData) {
  logger.info("ReviewsService.deleteReview called");
  //if there is no recipeId or reviewId then throw an argument error
  if (!receivedData.recipeId || !receivedData.reviewId) {
    throw new ArgumentError("Recipe Id or Review Id must be defined in Parameters");
  }
  try {
    const item = await reviewsDao.getOneReviewById(receivedData);
    if (!item) {
      throw new Error("No Review has this ID");
    } else {
      return item;
    }
  } catch(err) {
    throw err;
  }
}

// ==================================================

module.exports = {
  createNewReview,
  getReviews,
  deleteReview,
  getOneReview
};
