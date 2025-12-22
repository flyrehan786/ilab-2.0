const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // super (super without a lab_id) can access all labs' data.
    if (decoded.role === 'super' && !decoded.lab_id) {
      // This is a super; don't set req.lab_id to allow access to all labs.
    } else if (decoded.lab_id) {
      req.lab_id = decoded.lab_id;
    } else {
      // All other users must have a lab_id.
      return res.status(403).json({ error: 'Access denied. Lab ID is missing.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(403).json({ error: 'Access denied. User role not found.' });
    }

    // Allow 'super' to have all privileges
    if (userRole === 'super') {
      return next();
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { auth, authorize };
