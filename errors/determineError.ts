import { errorTypes } from './errorTypes';
import { ErrorREST } from './errorRest';

export const determineError = (errorMessage: string) => {
  switch (errorMessage) {
    case errorTypes.EXISTING_USER.message:
      throw new ErrorREST(errorTypes.EXISTING_USER);
    case errorTypes.NOT_AUTHENTICATED.message:
      throw new ErrorREST(errorTypes.NOT_AUTHENTICATED);
    case errorTypes.INCORRECT_CREDENTIALS.message:
      throw new ErrorREST(errorTypes.INCORRECT_CREDENTIALS);
    case errorTypes.INTERNAL.message:
      throw new ErrorREST(errorTypes.INTERNAL);
    case errorTypes.NO_BUSINESS_ID.message:
      throw new ErrorREST(errorTypes.NO_BUSINESS_ID);
    case errorTypes.NO_DEAL_ID.message:
      throw new ErrorREST(errorTypes.NO_DEAL_ID);
    default:
      throw new ErrorREST(errorTypes.INTERNAL);
  }
};
