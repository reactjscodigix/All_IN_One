export const environment = {
  production: process.env.REACT_APP_ENV === 'production',
  development: process.env.REACT_APP_ENV !== 'production',
  debug: process.env.REACT_APP_DEBUG === 'true',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
};

export const getApiUrl = (endpoint) => {
  return `${environment.apiUrl}${endpoint}`;
};

export const isDevelopment = () => environment.development;
export const isProduction = () => environment.production;

export default environment;
