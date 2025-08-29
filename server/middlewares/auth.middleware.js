import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  
  console.log('Auth middleware - Cookies:', req.cookies);
  console.log('Auth middleware - Token:', token);

  if (!token) {
    console.log('Auth middleware - No token found');
    return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Decoded token:', decodedToken);

    if (decodedToken.id) {
      req.body = req.body || {};
      req.body.userId = decodedToken.id;
      console.log('Auth middleware - User ID set:', decodedToken.id);
      next();
    } else {
      console.log('Auth middleware - No user ID in token');
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }
  } catch (error) {
    console.log('Auth middleware - JWT verification error:', error.message);
    return res.status(401).json({ success: false, message: "Invalid token. Please login again." });
  }
};

export default userAuth;
