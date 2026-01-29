export const authHeader = (token) => {
  if (token) {
    return { headers: { Authorization: `Bearer ${token}` } };
  } else {
    return {};
  }
}; 