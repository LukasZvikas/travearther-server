const request = require('supertest');
const mongoose = require('mongoose');
var chai = require('chai');
var assert = chai.assert;
const app = require('../../../app');
const User = mongoose.model('authentication');
const Business = mongoose.model('businesses');
const { ERROR__NOT_AUTHENTICATED } = require('../../../errors/errorTypes');

const newBusiness = {
  name: 'test place',
  image_url: 'asad',
  is_closed: false,
  review_count: 0,
  categories: [],
  rating: 0,
  coordinates: {
    latitude: 51.5259466,
    longitude: -0.0903366
  },
  price: '££',
  location: {
    address: '213 Old St, Old Street',
    city: 'London',
    zip_code: 'EC1V 9NR',
    country: 'Great Britain',
    state: null,
    display_address: ['213 Old St, Old Street, London EC1V 9NR']
  },
  phone: '020 7490 7490'
};

const compareObjects = (business, resultBusiness) => {
  return JSON.stringify(business) === JSON.stringify(resultBusiness);
};

describe('business', () => {
  describe('/save_place', () => {
    it('When user exists and type is save, should save the place and return an updated user saved places list', async () => {
      const newUser = new User({ email: 'test@gmail.com', password: 'password' });
      const user = await newUser.save();
      const business = await new Business(newBusiness).save();

      const result = await request(app)
        .post('/save_place')
        .send({ businessId: business.id, type: 'save', userId: user.id });
      const userAfterRequest = await User.findById(user.id);
      assert.equal(result.body.updated_saved_places[0]._id, business.id);
      assert.equal(userAfterRequest.saved_places[0], business.id);
    });

    it('When user exists and type is unsave, should remove the place and return an updated user saved places list', async () => {
      const business = await new Business(newBusiness).save();
      const newUser = new User({
        email: 'test@gmail.com',
        password: 'password',
        saved_places: [business.id]
      });
      const user = await newUser.save();

      const result = await request(app)
        .post('/save_place')
        .send({ businessId: business.id, type: 'unsave', userId: user.id });
      const userAfterRequest = await User.findById(user.id);
      assert.equal(result.body.updated_saved_places.length, 0);
      assert.equal(userAfterRequest.saved_places.length, 0);
    });

    it('When user is not authenticated, should throw an exception', async () => {
      await request(app)
        .post('/save_place')
        .send({ businessId: '3421342134dafsdafsa', type: 'unsave', userId: null })
        .expect(res => {
          assert.equal(res.body.error, ERROR__NOT_AUTHENTICATED);
        });
    });
  });

  describe('/saved_places', () => {
    it('When user is authenticated and user have saved places ids, should return a list of saved places', async () => {
      const business = await new Business(newBusiness).save();

      const user = new User({
        email: 'test@gmail.com',
        password: 'password',
        saved_places: [business.id]
      });

      await user.save();

      const result = await request(app)
        .get('/saved_places')
        .send({ userId: user.id });

      assert.equal(result.body.saved_places.length, 1);
    });

    it('When user is authenticated and user does not have saved places ids, should return an empty list of saved places', async () => {
      const user = new User({
        email: 'test@gmail.com',
        password: 'password',
        saved_places: []
      });

      await user.save();

      const result = await request(app)
        .get('/saved_places')
        .send({ userId: user.id });

      assert.equal(result.body.saved_places.length, 0);
    });

    it('When user is not authenticated and user does not have saved places ids, should return an empty list of saved places', async () => {
      await request(app)
        .get('/saved_places')
        .send({ userId: null })
        .expect(res => {
          assert.equal(res.body.error, ERROR__NOT_AUTHENTICATED);
        });
    });
  });

  describe('/business_details', () => {
    it('if user is authenticated and business is saved, should return business details object with is_saved set to true', async () => {
      const business = new Business(newBusiness);

      await business.save();

      const user = new User({
        email: 'test@gmail.com',
        password: 'password',
        saved_places: [business.id]
      });

      await user.save();

      const result = await request(app)
        .get(`/business_details/${business.id}`)
        .send({ userId: user.id });

      assert.equal(result.body.business_details.is_saved, true);

      delete result.body.business_details.is_saved;

      assert(compareObjects(business, result.body.business_details));
    });

    it('if user is not authenticated, should return business details object with is_saved set to false', async () => {
      const business = new Business(newBusiness);

      await business.save();

      const result = await request(app)
        .get(`/business_details/${business.id}`)
        .send({ userId: null });

      assert.equal(result.body.business_details.is_saved, false);

      delete result.body.business_details.is_saved;

      assert(compareObjects(business, result.body.business_details));
    });
  });
});
