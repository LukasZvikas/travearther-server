import { devConfig } from "./dev";
import { prodConfig } from "./prod";
import { testConfig } from "./test";

export const getConfig = () => {
  if (process.env.NODE_ENV === "production") {
    return prodConfig;
  } else if (process.env.NODE_ENV === "development") {
    return devConfig;
  } else {
    return devConfig;
  }
};
