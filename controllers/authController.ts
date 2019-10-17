import { getConfig } from '../config';
import User from '../models/authSchema';
import { errorTypes } from '../errors/errorTypes';
import { determineError } from '../errors/determineError';
import { ErrorREST } from '../errors/errorRest';

import axios from 'axios';

export const getUser = async (userId: string, isAuth) => {
  try {
    if (!isAuth) throw new ErrorREST(errorTypes.INTERNAL);

    return await User.findById(userId, (err, user) => {
      if (err) {
        throw new ErrorREST(errorTypes.NOT_AUTHENTICATED);
      }
      return user;
    });
  } catch (error) {
    determineError(error.message);
  }
};

export const signUp = async ({
  userDetails
}: {
  userModel: typeof User;
  userDetails: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}) => {
  try {
    const { AUTH0_URL, AUTH0_CONNECTION, AUTH0_CLIENT } = getConfig();
    const signUpResponse = await axios.post(
      `${AUTH0_URL}/dbconnections/signup`,
      {
        client_id: AUTH0_CLIENT,
        connection: AUTH0_CONNECTION,
        ...userDetails
      }
    );
    console.log('signUpResponse', signUpResponse);
    return signUpResponse.data;
  } catch (err) {
    throw new ErrorREST(errorTypes.EXISTING_USER);
  }
};

export const signIn = async ({ userModel, email, password }) => {
  try {
    // const { AUTH0_URL, AUTH0_CONNECTION, AUTH0_CLIENT } = getConfig();
    // const signUpResponse = await axios.get(`${AUTH0_URL}/authorize`, {
    //   client_id: AUTH0_CLIENT,
    //   connection: AUTH0_CONNECTION,
    //   redirect_uri: ''
    //   // ...userDetails
    // });
    // return signUpResponse.data;
  } catch (err) {
    throw new ErrorREST(errorTypes.EXISTING_USER);
  }
};

export const generateAuthToken = async (userId, email) => {
  try {
    return null;
  } catch (err) {
    throw new Error(err);
  }
};
