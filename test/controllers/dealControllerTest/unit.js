var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;
const {
  fetchBusinessDeals,
  fetchDealDetails,
  fetchFeaturedDeals,
  fetchDealsByCategory,
  saveDeal,
  likeDeal,
  fetchSavedDeals,
  fetchUsedDeals,
  fetchDealsUnderPricePoint
} = require('../../../controllers/dealController');

const businessId = '123123sfdsfsfsdf';
const userId = 'dsfsdfs324234234';
const dealId = 'dsfsadfasd32421341234';

describe('dealController', function() {
  describe('fetchBusinessDeals', async function() {
    it('When invoked, find deals query gets called once and with the correct parameters', async function() {
      const DealModelMock = {
        find: sinon.spy()
      };

      await fetchBusinessDeals(DealModelMock, businessId);

      assert(DealModelMock.find.calledOnce);
      assert(DealModelMock.find.calledWith({ business_id: businessId }));
    });
  });
  describe('fetchDealDetails', function() {
    it('When invoked without user id, find deal by id query gets called once and with correct the parameters and returns correct result', async function() {
      const DealModelMock = {
        findById: sinon.fake.returns({ _doc: {}, liked_by: [] })
      };

      const UserModelMock = {
        findById: sinon.spy()
      };

      const { deal_details } = await fetchDealDetails({
        dealModel: DealModelMock,
        userModel: UserModelMock,
        userId: null,
        dealId
      });

      assert(UserModelMock.findById.notCalled);
      assert(DealModelMock.findById.calledOnce);
      assert(DealModelMock.findById.calledWith(dealId));
      assert(!deal_details.is_saved);
      assert(!deal_details.is_liked);
      assert(!deal_details.is_used);
      assert(!deal_details.like_number);
    });

    it('When invoked with user id, find deal and find user by id queries get called once and with the correct parameters', async function() {
      const DealModelMock = {
        findById: sinon.fake.returns({ _doc: {}, liked_by: [] })
      };

      const UserModelMock = {
        findById: sinon.fake.returns({ saved_deals: [], used_deals: [], liked_deals: [] })
      };

      const { deal_details } = await fetchDealDetails({
        dealModel: DealModelMock,
        userModel: UserModelMock,
        userId,
        dealId
      });

      assert(UserModelMock.findById.calledOnce);
      assert(UserModelMock.findById.calledWith(userId));
      assert(DealModelMock.findById.calledOnce);
      assert(DealModelMock.findById.calledWith(dealId));
      assert(!deal_details.is_saved);
      assert(!deal_details.is_liked);
      assert(!deal_details.is_used);
      assert(!deal_details.like_number);
    });
  });
  describe('fetchFeaturedDeals', function() {
    it('When invoked, find deals query should get called once and with the correct parameters', async function() {
      const populateMock = sinon.fake();
      const DealModelMock = {
        find: sinon.fake(() => ({ populate: populateMock }))
      };

      await fetchFeaturedDeals(DealModelMock);

      assert(DealModelMock.find.calledOnce);
      assert(DealModelMock.find.calledWith({ featured: true }));
      assert(populateMock.calledOnce);
    });
  });

  describe('fetchCategoryDeals', function() {
    it('When invoked, find deals query should get called once and with the correct parameters', async function() {
      const DealModelMock = {
        find: sinon.spy(() => ({ populate: sinon.fake() }))
      };

      const category = 'mexican';

      await fetchDealsByCategory(DealModelMock, category);

      assert(DealModelMock.find.calledOnce);
      assert(
        DealModelMock.find.calledWith({
          'categories.title': category
        })
      );
    });
  });

  describe('saveDeal', function() {
    it('When invoked, userModel findOneAndUpdate, save and findById function get called in a sequence', async function() {
      const saveMock = sinon.fake();
      const populateMock = sinon.fake.returns({ saved_deals: [{}, {}] });
      const UserModelMock = {
        findOneAndUpdate: sinon.fake.returns({
          saved_deals: {},
          save: saveMock
        }),
        findById: sinon.fake(() => ({ populate: populateMock }))
      };
      const result = await saveDeal({ userModel: UserModelMock, userId, dealId, type: 'save' });

      assert(UserModelMock.findOneAndUpdate.calledOnce);
      assert(UserModelMock.findById.calledOnce);
      assert(saveMock.calledOnce);
      assert(populateMock.calledOnce);
      assert(saveMock.calledAfter(UserModelMock.findOneAndUpdate));
      assert(UserModelMock.findById.calledAfter(saveMock));
      assert.equal(result.updated_deal_list.length, 2);
    });
  });

  describe('likeDeal', function() {
    it('When invoked, userModel findOneAndUpdate, save and findById function get called in a sequence', async function() {
      const saveMock = sinon.fake();

      const DealModelMock = {
        findOneAndUpdate: sinon.fake.returns({
          liked_by: ['3414213414', '3123adasda'],
          save: saveMock
        })
      };

      const result = await likeDeal({ dealModel: DealModelMock, userId, dealId, type: 'like' });

      assert(DealModelMock.findOneAndUpdate.calledOnce);
      assert(saveMock.calledOnce);
      assert(saveMock.calledAfter(DealModelMock.findOneAndUpdate));
      assert.equal(result.like_number, 2);
    });
  });

  describe('fetchSavedDeals', function() {
    it('When invoked, find User by id query should get called once and with the correct parameters', async function() {
      const populateMock = sinon.fake.returns({ saved_deals: [] });

      const UserModelMock = {
        findById: sinon.fake(() => ({ populate: populateMock }))
      };

      await fetchSavedDeals(UserModelMock, userId);

      assert(UserModelMock.findById.calledOnce);
      assert(UserModelMock.findById.calledWith(userId));
      assert(populateMock.calledOnce);
    });
  });

  describe('fetchDealDetails', function() {
    it('When invoked, find deals query should get called once and with the correct parameters', async function() {
      const populateMock = sinon.fake.returns({ used_deals: [] });

      const UserModelMock = {
        findById: sinon.fake(() => ({ populate: populateMock }))
      };

      await fetchUsedDeals(UserModelMock, userId);

      assert(UserModelMock.findById.calledOnce);
      assert(UserModelMock.findById.calledWith(userId));
      assert(populateMock.calledOnce);
    });
  });

  describe('fetchDealDetails', function() {
    it('When invoked, find deals query should get called once and with the correct parameters', async function() {
      const DealModelMock = {
        find: sinon.fake.returns([])
      };

      await fetchDealsUnderPricePoint(DealModelMock, 5);

      assert(DealModelMock.find.calledOnce);
      assert(DealModelMock.find.calledWith({ price: { $lte: 5 } }));
    });
  });
});
