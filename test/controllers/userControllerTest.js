var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;
const { signUp, signIn } = require('../../controllers/authController');

const userId = 'dsfsdfs324234234';
const email = 'test@gmail.com';
const password = 'password';

describe('userController', function() {
  describe('signUp', () => {
    it('When invoked, if user exists, throws an exception', async function() {
      const UserModelMock = {
        findOne: sinon.fake.returns(true)
      };
      try {
        await signUp({ userModel: UserModelMock, email, password });
      } catch (error) {
        assert.equal(error.message, 'User with this email already exists');
      }
    });

    it('When invoked, if user does not exist, save user and email service get called, and token is returned', async function() {
      const saveMock = sinon.fake.returns({ email, password });

      const UserModelMock = function() {
        this.save = saveMock;
      };

      UserModelMock.findOne = sinon.fake.returns(false);

      UserModelMock.save = function() {};

      const emailService = {
        send: sinon.fake()
      };

      const result = await signUp({ userModel: UserModelMock, email, password, emailService });

      assert(UserModelMock.findOne.calledOnce);
      assert(saveMock.calledOnce);
      assert(emailService.send.calledOnce);
      assert(saveMock.calledAfter(UserModelMock.findOne));
      assert(emailService.send.calledAfter(saveMock));
      assert(result.token);
    });
  });

  describe('signIn', () => {
    it('When invoked, if credentials are wrong, throws an exception', async function() {
      const UserModelMock = {
        findOne: sinon.fake.returns(false)
      };
      try {
        await signIn({ userModel: UserModelMock, email, password });
      } catch (error) {
        assert.equal(error.message, 'Your email or password is incorrect. Please try again');
      }

      assert(UserModelMock.findOne.calledOnce);
    });

    it('When invoked, if user email exists, but password is incorrect, throws an exception', async function() {
      const UserModelMock = {
        findOne: sinon.fake.returns(true)
      };

      const bcryptService = {
        compare: sinon.fake.returns(false)
      };

      try {
        await signIn({ userModel: UserModelMock, email, password, bcryptService });
      } catch (error) {
        assert.equal(error.message, 'Your email or password is incorrect. Please try again');
      }
      assert(UserModelMock.findOne.calledOnce);
      assert(bcryptService.compare.calledOnce);
    });

    it('When invoked, if user email exists, but password is correct, should return token', async function() {
      const UserModelMock = {
        findOne: sinon.fake.returns(true)
      };

      const bcryptService = {
        compare: sinon.fake.returns(true)
      };

      const result = await signIn({ userModel: UserModelMock, email, password, bcryptService });

      assert(UserModelMock.findOne.calledOnce);
      assert(bcryptService.compare.calledOnce);
      assert(result.token);
    });
  });

  describe('getUser', () => {
    it('When invoked, if user exists, throws an exception', async function() {
      const UserModelMock = {
        findOne: sinon.fake.returns(true)
      };
      try {
        await signUp({ userModel: UserModelMock, email, password });
      } catch (error) {
        assert.equal(error.message, 'User with this email already exists');
      }
    });

    it('When invoked, if user does not exist, save user and email service get called, and token is returned', async function() {
      const saveMock = sinon.fake.returns({ email, password });

      const UserModelMock = function() {
        this.save = saveMock;
      };

      UserModelMock.findOne = sinon.fake.returns(false);

      UserModelMock.save = function() {};

      const emailService = {
        send: sinon.fake()
      };

      const result = await signUp({ userModel: UserModelMock, email, password, emailService });

      assert(UserModelMock.findOne.calledOnce);
      assert(saveMock.calledOnce);
      assert(emailService.send.calledOnce);
      assert(saveMock.calledAfter(UserModelMock.findOne));
      assert(emailService.send.calledAfter(saveMock));
      assert(result.token);
    });
  });
});
