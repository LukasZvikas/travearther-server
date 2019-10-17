const mongoose = require('mongoose');
const businessController = require('../controllers/businessController');
const User = mongoose.model('authentication');
const Business = mongoose.model('businesses');

export default app => {
  app.post(
    '/save_place',
    async ({ body: { businessId, type, userId } }, res, next) => {
      try {
        const result = await businessController.savePlace({
          userModel: User,
          userId,
          businessId,
          type
        });

        res.status(200).send(result);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    '/business_details/*',
    async ({ params, body: { userId } }, res, next) => {
      try {
        const businessId = params[0];

        const result = await businessController.fetchBusinessDetails({
          businessModel: Business,
          userModel: User,
          userId,
          businessId
        });

        res.status(200).send(result);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get('/saved_places', async ({ body: { userId } }, res, next) => {
    try {
      const result = await businessController.fetchSavedPlaces(User, userId);

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  });

  app.get('/places_nearby', async ({ query }, res, next) => {
    try {
      if (!query.latitude || !query.longitude)
        throw new Error('You must provide latitude and longitude');

      const result = await businessController.findBusinessesNearby(
        Business,
        {
          latitude: query.latitude,
          longitude: query.longitude
        },
        query.term
      );

      res.send({ businesses: result });
    } catch (error) {}
  });

  app.post('/business/search', businessController.findBusinessesByTerm);
};
