const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.lab_id = decoded.lab_id;
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

    // Allow 'System Administrator' to have all 'admin' privileges
    if (userRole === 'System Administrator' && roles.includes('admin')) {
      return next();
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { auth, authorize };
