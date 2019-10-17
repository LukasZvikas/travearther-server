import User from '../models/authSchema';
import Deal from '../models/dealSchema';
import { isInArray } from '../services/helperFunctions';
import { determineError } from '../errors/determineError';
import { ErrorREST } from '../errors/errorRest';
import { errorTypes } from '../errors/errorTypes';

// tested
export const fetchBusinessDeals = async ({
  dealModel,
  businessId
}: {
  dealModel: typeof Deal;
  businessId: string;
}) => {
  try {
    if (!businessId) throw new ErrorREST(errorTypes.NO_BUSINESS_ID);

    const businessDeals = await dealModel.find({ business_id: businessId });

    return { business_deals: businessDeals };
  } catch (error) {
    return error;
  }
};

// tested
export const fetchDealDetails = async ({
  dealModel,
  userModel,
  userId,
  dealId
}: {
  dealModel: typeof Deal;
  userModel: typeof User;
  userId: string;
  dealId: string;
}) => {
  try {
    const dealDetails = await dealModel.findById(dealId, (err, deal) => {
      if (err) throw new ErrorREST(errorTypes.INTERNAL);
      return deal;
    });

    if (!userId) {
      return {
        deal_details: {
          ...dealDetails._doc,
          is_saved: false,
          is_used: false,
          is_liked: false,
          like_number: dealDetails.liked_by.length
        }
      };
    } else {
      const user = await userModel.findById(userId, async (err, user) => {
        if (!user) {
          throw new ErrorREST(errorTypes.INTERNAL);
        }
        return user;
      });

      const is_saved = isInArray(user.saved_deals, dealId);
      const is_used = isInArray(user.used_deals, dealId);
      const is_liked = isInArray(dealDetails.liked_by, userId);

      return {
        deal_details: {
          ...dealDetails._doc,
          is_saved,
          is_used,
          is_liked,
          like_number: dealDetails.liked_by.length
        }
      };
    }
  } catch (error) {
    determineError(error.message);
  }
};

export const fetchFeaturedDeals = async (dealModel: typeof Deal) => {
  try {
    const featuredDeals = await dealModel
      .find({ featured: true })
      .populate('business_details');

    return { featured_deals: featuredDeals };
  } catch (error) {
    determineError(error.message);
  }
};

export const fetchDealsByCategory = async ({
  dealModel,
  category
}: {
  dealModel: typeof Deal;
  category: string;
}) => {
  try {
    const categoryDeals = await dealModel
      .find({
        'categories.title': category
      })
      .populate('business_details');

    return { category_deals: categoryDeals };
  } catch (error) {
    determineError(error.message);
  }
};

// tested
export const saveDeal = async ({
  userModel,
  userId,
  dealId,
  type
}: {
  userModel: typeof User;
  userId: string;
  dealId: string;
  type: string;
}) => {
  try {
    if (!dealId) {
      throw new ErrorREST(errorTypes.NO_DEAL_ID);
    }

    if (!userId) {
      throw new ErrorREST(errorTypes.NOT_AUTHENTICATED);
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      type === 'save'
        ? { $addToSet: { saved_deals: dealId } }
        : { $pull: { saved_deals: dealId } },
      { new: true }
    );

    if (!updatedUser) throw new ErrorREST(errorTypes.INTERNAL);

    await updatedUser.save();

    const populatedUser = await userModel
      .findById(userId)
      .populate('saved_deals');

    return { updated_deal_list: populatedUser.saved_deals };
  } catch (error) {
    determineError(error.message);
  }
};

// tested
export const likeDeal = async ({
  dealModel,
  userId,
  dealId,
  type
}: {
  dealModel: typeof Deal;
  userId: string;
  dealId: string;
  type: string;
}) => {
  try {
    if (!dealId) {
      throw new ErrorREST(errorTypes.NO_DEAL_ID);
    }

    if (!userId) {
      throw new ErrorREST(errorTypes.NOT_AUTHENTICATED);
    }
    const updatedDeal = await dealModel.findOneAndUpdate(
      { _id: dealId },
      type === 'like'
        ? { $addToSet: { liked_by: userId } }
        : { $pull: { liked_by: userId } },
      { new: true }
    );

    if (!updatedDeal) throw new ErrorREST(errorTypes.INTERNAL);

    await updatedDeal.save();

    return { like_number: updatedDeal.liked_by.length };
  } catch (error) {
    determineError(error.message);
  }
};

// tested
export const fetchSavedDeals = async ({
  userModel,
  userId
}: {
  userModel: typeof User;
  userId: string;
}) => {
  try {
    if (!userId) throw new ErrorREST(errorTypes.NOT_AUTHENTICATED);
    const user = await userModel.findById(userId);

    if (!user) throw new ErrorREST(errorTypes.NOT_AUTHENTICATED);

    user.populate('saved_deals');

    return { saved_deals: user.saved_deals };
  } catch (error) {
    determineError(error.message);
  }
};

export const fetchDealsUnderPricePoint = async ({
  dealModel,
  priceUnder
}: {
  dealModel: typeof Deal;
  priceUnder: number;
}) => {
  try {
    const deals = await dealModel.find({ price: { $lte: priceUnder } });

    return { dealsUnderPricePoint: deals };
  } catch (error) {
    determineError(error.message);
  }
};

// export const fetchUsedDeals = async (userModel, userId) => {
//   try {
//     const user = await userModel.findById(userId).populate('used_deals');

//     return { used_deals: user.used_deals };
//   } catch (error) {
//     determineError(error.message);
//   }
// };

// export const useDeal = async (req, res) => {
//   const dealId = req.body.dealId;
//   const userId = req.userId;

//   try {
//     const user = await User.findById(userId);

//     let index = null;

//     for (const deal of user.used_deals) {
//       if (deal.toString() === dealId) {
//         index = user.saved_deals.indexOf(deal);
//       }
//     }

//     if (index !== null) {
//       user.used_deals.splice(index, 1);
//     } else {
//       user.used_deals.push(dealId);
//     }
//     await user.save(async (err, user) => {
//       if (err) {
//         throw new Error(ErrorREST.INTERNAL);
//       }
//       const populatedUser = await User.findById(userId).populate('used_deals');
//       res.send({ updated_used_deal_list: populatedUser.used_deals });
//     });
//   } catch (error) {
//     determineError(error.message);
//   }
// };
