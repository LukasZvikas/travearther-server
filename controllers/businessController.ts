import Fuse from 'fuse.js';
import Business from '../models/businessSchema';
import { isInArray } from '../services/helperFunctions';
import { errorTypes } from '../errors/errorTypes';
import { determineError } from '../errors/determineError';
import { ErrorREST } from '../errors/errorRest';

export const findBusinessesByTerm = async ({ body: { term } }, res) => {
  try {
    const businesses = await Business.find();

    const options = {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name', 'categories.title']
    };

    const fuse = new Fuse(businesses, options);

    const result = fuse.search(term);

    if (result.length) {
      res.send({ businesses: result });
    } else if (!term) {
      res.send({ businesses: [] });
    }
    res.send({ businesses: null });
  } catch (error) {
    throw new ErrorREST(error);
  }
};

//tested
export const fetchBusinessDetails = async ({
  businessModel,
  userModel,
  userId,
  businessId
}) => {
  try {
    const businessDetails = await businessModel.findById(businessId);
    if (!userId) {
      return {
        business_details: {
          ...businessDetails._doc,
          is_saved: false
        }
      };
    } else {
      const user = await userModel.findById(userId, (_, user) => {
        if (!user) {
          throw new ErrorREST(errorTypes.INTERNAL);
        }
        return user;
      });

      const is_saved = isInArray(user.saved_places, businessId);

      return {
        business_details: {
          ...businessDetails._doc,
          is_saved
        }
      };
    }
  } catch (error) {
    determineError(error.message);
  }
};

// tested
export const savePlace = async ({ userModel, userId, businessId, type }) => {
  try {
    if (!businessId) {
      throw new ErrorREST(errorTypes.NO_BUSINESS_ID);
    }

    if (!userId) {
      throw new ErrorREST(errorTypes.NOT_AUTHENTICATED);
    }
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      type === 'save'
        ? { $addToSet: { saved_places: businessId } }
        : { $pull: { saved_places: businessId } },
      { new: true }
    );

    if (!updatedUser) throw new ErrorREST(errorTypes.INTERNAL);

    await updatedUser.save();

    const populatedUser = await userModel
      .findById(userId)
      .populate('saved_places');

    return { updated_saved_places: populatedUser.saved_places };
  } catch (error) {
    determineError(error.message);
  }
};

// tested
export const fetchSavedPlaces = async (userModel, userId) => {
  try {
    if (!userId) throw new ErrorREST(errorTypes.NOT_AUTHENTICATED);

    const user = await userModel.findById(userId).populate('saved_places');

    return { saved_places: user.saved_places };
  } catch (error) {
    determineError(error.message);
  }
};

export const findBusinessesNearby = async (
  businessModel,
  locationCoordinates,
  term
) => {
  try {
    const result = await businessModel.aggregate(
      [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [
                parseFloat(locationCoordinates.latitude),
                parseFloat(locationCoordinates.longitude)
              ]
            },
            distanceField: 'dist.calculated',
            maxDistance: 10000,
            spherical: true
          }
        }
      ],
      (err, result) => {
        if (err) throw new ErrorREST(errorTypes.INTERNAL);

        return result;
      }
    );

    const options = {
      shouldSort: true,
      threshold: 0.1,
      location: 0,
      distance: 100,
      maxPatternLength: 16,
      minMatchCharLength: 1,
      keys: ['name', 'categories.title']
    };

    return new Fuse(result, options).search(term);
  } catch (error) {
    determineError(error.message);
  }
};
