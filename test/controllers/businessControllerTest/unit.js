var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;
const {
  fetchBusinessDetails,
  savePlace,
  fetchSavedPlaces
} = require('../../../controllers/businessController');

const businessId = '123123sfdsfsfsdf';
const userId = 'dsfsdfs324234234';

describe('businessController', function() {
  describe('fetchBusinessDetails', async function() {
    it('When invoked without user id, find deal by id query gets called once and with correct the parameters and returns correct result', async function() {
      const BusinessModelMock = {
        findById: sinon.fake.returns({ _doc: {} })
      };

      const UserModelMock = {
        findById: sinon.spy()
      };

      const { business_details } = await fetchBusinessDetails({
        businessModel: BusinessModelMock,
        userModel: UserModelMock,
        userId: null,
        businessId
      });

      assert(UserModelMock.findById.notCalled);
      assert(BusinessModelMock.findById.calledOnce);
      assert(BusinessModelMock.findById.calledWith(businessId));
      assert(!business_details.is_saved);
    });

    it('When invoked with user id, find deal and find user by id queries get called once and with the correct parameters', async function() {
      const BusinessModelMock = {
        findById: sinon.fake.returns({ _doc: {} })
      };

      const UserModelMock = {
        findById: sinon.fake.returns({ saved_places: [] })
      };

      const { business_details } = await fetchBusinessDetails({
        businessModel: BusinessModelMock,
        userModel: UserModelMock,
        userId,
        businessId
      });

      assert(UserModelMock.findById.calledOnce);
      assert(UserModelMock.findById.calledWith(userId));
      assert(BusinessModelMock.findById.calledOnce);
      assert(BusinessModelMock.findById.calledWith(businessId));
      assert(!business_details.is_saved);
    });
  });

  describe('savePlace', function() {
    it('When invoked, userModel findOneAndUpdate, save and findById function get called in a sequence', async function() {
      const saveMock = sinon.fake();
      const populateMock = sinon.fake.returns({ saved_places: [{}, {}] });
      const UserModelMock = {
        findOneAndUpdate: sinon.fake.returns({
          saved_places: {},
          save: saveMock
        }),
        findById: sinon.fake(() => ({ populate: populateMock }))
      };
      const result = await savePlace({
        userModel: UserModelMock,
        userId,
        businessId,
        type: 'save'
      });

      assert(UserModelMock.findOneAndUpdate.calledOnce);
      assert(UserModelMock.findById.calledOnce);
      assert(saveMock.calledOnce);
      assert(populateMock.calledOnce);
      assert(saveMock.calledAfter(UserModelMock.findOneAndUpdate));
      assert(UserModelMock.findById.calledAfter(saveMock));
      assert.equal(result.updated_saved_places.length, 2);
    });
  });

  describe('fetchSavedPlaces', function() {
    it('When invoked, find User by id query should get called once and with the correct parameters', async function() {
      const populateMock = sinon.fake.returns({ saved_places: [] });

      const UserModelMock = {
        findById: sinon.fake(() => ({ populate: populateMock }))
      };

      await fetchSavedPlaces(UserModelMock, userId);

      assert(UserModelMock.findById.calledOnce);
      assert(UserModelMock.findById.calledWith(userId));
      assert(populateMock.calledOnce);
    });
  });
});
