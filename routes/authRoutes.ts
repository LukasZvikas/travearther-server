import * as authController from '../controllers/authController';
import User from '../models/authSchema';
import sgMail from '@sendgrid/mail';
import { getConfig } from '../config';

const keys = getConfig();

export default app => {
  app.get('/user', async (req, res, next) => {
    console.log('REQ', req);
    try {
      const result = await authController.getUser(User, {});
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  });

  app.post(
    '/signup',
    async ({ body: { email, password, firstName, lastName } }, res) => {
      console.log('BODY', email, password);
      try {
        const result = await authController.signUp({
          userModel: User,
          userDetails: {
            email,
            password,
            firstName,
            lastName
          }
        });
        res.status(200).send(result);
      } catch (error) {
        res
          .status(error.response.status)
          .send({ error: error.response.message });
      }
    }
  );

  app.post('/signin', async ({ body: { email, password } }, res, next) => {
    try {
      const result = await authController.signIn({
        userModel: User,
        email,
        password
      });

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  });
};
