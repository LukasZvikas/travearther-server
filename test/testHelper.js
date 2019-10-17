const mongoose = require('mongoose');

before(done => {
  mongoose.connect('mongodb://localhost/layovero-test');
  mongoose.connection
    .once('open', () => {
      console.log('connected to layovero-test');
      done();
    })
    .on('error', error => {
      console.warn('Warningaaaa', error);
    });
});

const dropCollection = collectionName =>
  mongoose.connection.collections[collectionName]
    .drop()
    .catch(err => (err.message === 'ns not found' ? Promise.resolve() : Promise.reject(err)));

beforeEach(() =>
  Promise.all([
    dropCollection('authentications'),
    dropCollection('businesses'),
    dropCollection('deals')
  ])
);
