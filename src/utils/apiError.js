// The API always answers failures with { success: false, message }, so screens
// can show the server's wording instead of a generic one.
export const apiErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;
