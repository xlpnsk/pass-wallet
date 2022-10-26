import axios from 'axios';    

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    const token = window.localStorage.getItem('token');
    // Do something before request is sent
    if(config.headers !== undefined){
    if(token){
      config.headers.Authorization = `Bearer ${token}`;
    }
    else{
      config.headers.Authorization = '';
      delete config.headers?.Authorization;
    }
    }
    config.baseURL = process.env.REACT_APP_API_URL;
    return config;
  },
  function (error) {
    // Do something with request error
    if(error.response.status ===401){
      window.localStorage.removeItem('token')
    }
    return Promise.reject(error);
  }
);

axios.interceptors.response.use((value) => {return value}, (error) => {
  if(error.response.status ===401){
    window.localStorage.removeItem('token')
    return Promise.reject(error);
  }
})

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  patch: axios.patch
};