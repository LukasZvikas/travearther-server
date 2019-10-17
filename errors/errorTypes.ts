export const errorTypes = {
  EXISTING_USER: {
    status: 401,
    message: 'User with this email already exists'
  },
  NOT_AUTHENTICATED: {
    status: 401,
    message: 'User is not authenticated. Please login first'
  },
  INTERNAL: {
    status: 400,
    message: 'Sorry, an internal error occurred. Please try again'
  },
  INCORRECT_CREDENTIALS: {
    status: 401,
    message: 'Your email or password is incorrect. Please try again'
  },
  NO_BUSINESS_ID: {
    status: 400,
    message: 'You must provide business id'
  },
  NO_DEAL_ID: { status: 400, message: 'You must provide deal id' }
};
