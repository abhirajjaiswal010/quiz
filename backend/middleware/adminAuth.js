const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const secret = process.env.ADMIN_SECRET || 'clubquizadmin123';

  if (!adminKey || adminKey !== secret) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: Invalid or missing admin key',
    });
  }

  next();
};

module.exports = adminAuth;
