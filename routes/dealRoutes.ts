import * as dealController from '../controllers/dealController';
import { isAuth } from '../services/isAuth';
import  Deal from '../models/dealSchema';
import  User from '../models/authSchema';

export default app => {
  app.get(
    '/deal_details/*',
    async ({ params, body: { userId } }, res, next) => {
      try {
        const dealId = params[0];

        const result = await dealController.fetchDealDetails({
          dealModel: Deal,
          userModel: User,
          userId,
          dealId
        });

        res.status(200).send(result);
      } catch (error) {
        next(error);
      }
    }
  );

  app.get('/business_deals/*', async ({ params }, res, next) => {
    try {
      const businessId = params[0];

      const result = await dealController.fetchBusinessDeals({
        dealModel: Deal,
        businessId
      });

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  });

  app.get('/featured_deals', async (req, res, next) => {
    try {
      const result = await dealController.fetchFeaturedDeals(Deal);

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  });

  app.get('/category_deals/*', async ({ params }, res, next) => {
    try {
      const category = params[0];

      const result = await dealController.fetchDealsByCategory({
        dealModel: Deal,
        category: category.toLowerCase()
      });

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  });

  app.post(
    '/save_deal',
    isAuth,
    async ({ body: { dealId, type, userId } }, res, next) => {
      try {
        const result = await dealController.saveDeal({
          userModel: User,
          userId,
          dealId,
          type
        });

        res.status(200).send(result);
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/like_deal',
    isAuth,
    async ({ body: { dealId, userId, type } }, res, next) => {
      try {
        const result = await dealController.likeDeal({
          dealModel: Deal,
          userId,
          dealId,
          type
        });

        res.status(200).send(result);
      } catch (error) {
        next(error);
      }
    }
  );

  //update this
  app.get('/saved_deals', async ({ body: { userId } }, res, next) => {
    try {
      const result = await dealController.fetchSavedDeals({
        userModel: User,
        userId
      });

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  });

  // app.get('/used_deals', isAuth, async ({ userId }, res, next) => {
  //   try {
  //     const result = await dealController.getUsedDeals(userModel, userId);

  //     res.status(200).send(result);
  //   } catch (error) {
  //     next(error);
  //   }
  // });

  app.get('/deals_under_price_point/*', async ({ params }, res, next) => {
    try {
      const priceUnder = parseInt(params[0]);

      const result = await dealController.fetchDealsUnderPricePoint({
        dealModel: Deal,
        priceUnder
      });

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  });

  // app.post('/use_deal', isAuth, dealController.useDeal);
};
