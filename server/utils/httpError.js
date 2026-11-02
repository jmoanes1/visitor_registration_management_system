// An Error that carries the HTTP status the response should use.
const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

export default httpError;
