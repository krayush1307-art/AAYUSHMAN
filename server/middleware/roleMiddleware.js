// Check whether the logged-in user has permission
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Authentication middleware must run before this middleware
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    // Allow only the specified roles
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

export default authorizeRoles;
