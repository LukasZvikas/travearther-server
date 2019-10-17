// import axios from 'axios';

// export const getCommonConfig = (headers?: {}): axios.AxiosRequestConfig => {
//   const authorization = auth.isAuthenticated()
//     ? { Authorization: `Bearer ${auth.getIdToken()}` }
//     : {};
//   return {
//     headers: Object.assign(
//       {
//         'Content-Type': 'application/json',
//         Accept: 'application/json'
//       },
//       authorization,
//       headers
//     )
//   };
// };

// export const request = async <T>(
//   config: axios.AxiosRequestConfig,
//   postingFormData?: boolean
// ): Promise<axios.AxiosResponse<T>> => {
//   if (postingFormData) {
//     const { url, data, ...rest } = config;
//     return await axios.default.post<T>(url!, data, rest);
//   }

//   return await axios.default.request<T>(config);
// };
