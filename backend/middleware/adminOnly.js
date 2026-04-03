const ErrorResponse = require('../utils/errorResponse');

const adminOnly = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const secretKey = process.env.ADMIN_SECRET || 'clubquizadmin123';

  if (!adminKey || adminKey !== secretKey) {
    return next(new ErrorResponse('Unauthorized access. Invalid Admin Key.', 401));
  }
  next();
};

module.exports = adminOnly;
