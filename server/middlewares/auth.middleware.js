import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  
  console.log('Auth middleware - Cookies:', req.cookies);
  console.log('Auth middleware - Token:', token);
  console.log('Auth middleware - Headers:', {
    'user-agent': req.headers['user-agent'],
    'origin': req.headers['origin'],
    'referer': req.headers['referer']
  });

  if (!token) {
    console.log('Auth middleware - No token found');
    return res.status(401).json({ 
      success: false, 
      message: "Not Authorized. Login Again",
      error: "No authentication token found in cookies"
    });
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
        error: "Token does not contain user ID"
      });
    }
  } catch (error) {
    console.log('Auth middleware - JWT verification error:', error.message);
    
    // Provide more specific error messages
    let errorMessage = "Invalid token. Please login again.";
    if (error.name === 'TokenExpiredError') {
      errorMessage = "Token expired. Please login again.";
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = "Invalid token format. Please login again.";
    }
    
    return res.status(401).json({ 
      success: false, 
      message: errorMessage,
      error: error.message 
    });
  }
};

export default userAuth;
