// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }
};

// Check if user is already logged in
const requireGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.status(400).json({
      success: false,
      message: 'You are already logged in.'
    });
  } else {
    return next();
  }
};

module.exports = {
  requireAuth,
  requireGuest
};
