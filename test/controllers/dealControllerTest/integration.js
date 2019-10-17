const request = require('supertest');
const mongoose = require('mongoose');
var chai = require('chai');
var assert = chai.assert;
const app = require('../../../app');
const User = mongoose.model('authentication');
const Business = mongoose.model('businesses');
const Deal = mongoose.model('deals');
const { ERROR__NOT_AUTHENTICATED } = require('../../../errors/errorTypes');

const newBusiness = {
  name: 'test place',
  image_url: 'https://...',
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

const newDeal = {
  business_name: 'test deal',
  business_details: '5d6d2210dc01de1704655bf2',
  business_id: '5d6d2210dc01de1704655bf4',
  categories: [{ title: 'Italian' }],
  deal_tag_line: 'this is test deal tag line',
  deal_description: 'test deal descriptions',
  image: 'https://...',
  featured: false,
  liked_by: []
};

const compareObjects = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

describe('deals', () => {
  describe('/save_deal', () => {
    it('When user exists and type is save, should save the deal and return updated user deal list', async () => {
      const user = await new User({ email: 'test@gmail.com', password: 'password' }).save();

      const business = await new Business(newBusiness).save();

      const deal = new Deal(newDeal);

      deal.business_details = business.id;

      await deal.save();

      const result = await request(app)
        .post('/save_deal')
        .send({ dealId: deal.id, type: 'save', userId: user.id });

      const userAfterRequest = await User.findById(user.id);
      assert(compareObjects(result.body.updated_deal_list[0], deal));
      assert.equal(userAfterRequest.saved_deals[0], deal.id);
    });

    it('When user exists and type is unsave, should unsave the deal and return updated user deal list', async () => {
      const business = await new Business(newBusiness).save();

      const deal = new Deal(newDeal);

      deal.business_details = business.id;

      await deal.save();

      const newUser = new User({
        email: 'test@gmail.com',
        password: 'password',
        saved_deals: [deal.id]
      });
      const user = await newUser.save();

      const result = await request(app)
        .post('/save_deal')
        .send({ dealId: deal.id, type: 'unsave', userId: user.id });

      const userAfterRequest = await User.findById(user.id);
      assert.equal(result.body.updated_deal_list.length, 0);
      assert.equal(userAfterRequest.saved_deals.length, 0);
    });

    it('When user is not authenticated, should throw an exception', async () => {
      await request(app)
        .post('/save_deal')
        .send({ dealId: '123123123asdasdas', type: 'unsave', userId: null })
        .expect(res => {
          console.log('RESSS', res);
          assert.equal(res.body.error, ERROR__NOT_AUTHENTICATED);
        });
    });
  });

  describe('/like_deal', () => {
    it('When user exists and type is like, should like the deal and return updated like number', async () => {
      const user = await new User({ email: 'test@gmail.com', password: 'password' }).save();

      const business = await new Business(newBusiness).save();

      const deal = new Deal(newDeal);

      deal.business_details = business.id;

      await deal.save();

      const result = await request(app)
        .post('/like_deal')
        .send({ dealId: deal.id, type: 'like', userId: user.id });

      const dealAfterRequest = await Deal.findById(deal.id);
      assert.equal(result.body.like_number, deal.liked_by.length + 1);
      assert.equal(dealAfterRequest.liked_by[0], user.id);
    });

    it('When user exists and type is unlike, should unlike the deal and return updated like number', async () => {
      const user = await new User({ email: 'test@gmail.com', password: 'password' }).save();
      const user2 = await new User({ email: 'test1@gmail.com', password: 'password' }).save();

      const business = await new Business(newBusiness).save();

      const deal = new Deal(newDeal);

      deal.liked_by.push(user.id, user2.id);

      deal.business_details = business.id;

      await deal.save();

      await user.save();

      const result = await request(app)
        .post('/like_deal')
        .send({ dealId: deal.id, type: 'unlike', userId: user.id });

      const dealAfterRequest = await Deal.findById(deal.id);
      assert.equal(result.body.like_number, deal.liked_by.length - 1);
      assert.equal(dealAfterRequest.liked_by[0], user2.id);
    });

    it('When user is not authenticated, should throw an exception', async () => {
      await request(app)
        .post('/like_deal')
        .send({ dealId: '123123123asdasdas', type: 'unlike', userId: null })
        .expect(res => {
          assert.equal(res.body.error, ERROR__NOT_AUTHENTICATED);
        });
    });
  });

  describe('/saved_places', () => {
    it('When user is authenticated and user have saved places ids, should return a list of saved places', async () => {
      const deal = await new Deal(newDeal).save();

      const user = new User({
        email: 'test@gmail.com',
        password: 'password',
        saved_deals: [deal.id]
      });

      await user.save();

      const result = await request(app)
        .get('/saved_deals')
        .send({ userId: user.id });

      assert.equal(result.body.saved_deals.length, 1);
    });

    it('When user is authenticated and user does not have saved places ids, should return an empty list of saved places', async () => {
      const user = new User({
        email: 'test@gmail.com',
        password: 'password',
        saved_places: []
      });

      await user.save();

      const result = await request(app)
        .get('/saved_deals')
        .send({ userId: user.id });

      assert.equal(result.body.saved_deals.length, 0);
    });

    it('When user is not authenticated and user does not have saved places ids, should return an empty list of saved places', async () => {
      await request(app)
        .get('/saved_deals')
        .send({ userId: null })
        .expect(res => {
          assert.equal(res.body.error, ERROR__NOT_AUTHENTICATED);
        });
    });
  });

  describe('/deal_details', () => {
    it('if user is authenticated and deal is saved, should return deal details object with is_saved set to true', async () => {
      const deal = new Deal(newDeal);

      await deal.save();

      const user = await new User({
        email: 'test@gmail.com',
        password: 'password',
        saved_deals: [deal.id]
      }).save();

      const result = await request(app)
        .get(`/deal_details/${deal.id}`)
        .send({ userId: user.id });

      assert.equal(result.body.deal_details.is_saved, true);
      assert.equal(result.body.deal_details.is_liked, false);

      delete result.body.deal_details.is_liked;
      delete result.body.deal_details.like_number;
      delete result.body.deal_details.is_saved;
      delete result.body.deal_details.is_used;

      assert(compareObjects(deal, result.body.deal_details));
    });

    it('if user is not authenticated, should return business details object with is_saved set to false', async () => {
      const deal = new Deal(newDeal);

      await deal.save();

      const result = await request(app)
        .get(`/deal_details/${deal.id}`)
        .send({ userId: null });

      assert.equal(result.body.deal_details.is_saved, false);

      delete result.body.deal_details.is_liked;
      delete result.body.deal_details.like_number;
      delete result.body.deal_details.is_saved;
      delete result.body.deal_details.is_used;

      assert(compareObjects(deal, result.body.deal_details));
    });

    it('if user is authenticated and deal is liked, should return deal details object with is_liked set to true', async () => {
      const user = await new User({
        email: 'test@gmail.com',
        password: 'password'
      }).save();

      const deal = new Deal(newDeal);

      deal.liked_by.push(user.id);

      await deal.save();

      const result = await request(app)
        .get(`/deal_details/${deal.id}`)
        .send({ userId: user.id });

      const dealAfterRequest = await Deal.findById(deal.id);
      assert.equal(dealAfterRequest.liked_by.length, result.body.deal_details.like_number);
      assert.equal(result.body.deal_details.is_saved, false);
      assert.equal(result.body.deal_details.is_liked, true);

      delete result.body.deal_details.is_liked;
      delete result.body.deal_details.like_number;
      delete result.body.deal_details.is_saved;
      delete result.body.deal_details.is_used;

      assert(compareObjects(deal, result.body.deal_details));
    });
  });
  describe('/business_deals', () => {
    it('When business id is provided, should return a list of business deals', async () => {
      const business = await new Business(newBusiness).save();

      const deal = new Deal(newDeal);

      deal.business_id = business.id;

      await deal.save();

      const result = await request(app)
        .get(`/business_deals/${business.id}`)
        .send();

      assert.equal(result.body.business_deals.length, 1);
      assert(compareObjects(deal, result.body.business_deals[0]));
    });
  });
});
