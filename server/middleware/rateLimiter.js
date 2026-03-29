const requestCounts = {};

module.exports = (maxRequests, windowMs) => {
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();

    if (!requestCounts[userId]) {
      requestCounts[userId] = { count: 1, startTime: now };
      return next();
    }

    const { count, startTime } = requestCounts[userId];
    const elapsed = now - startTime;

    if (elapsed > windowMs) {
      requestCounts[userId] = { count: 1, startTime: now };
      return next();
    }

    if (count >= maxRequests) {
      return res.status(429).json({
        error: `Too many requests — please wait ${Math.ceil((windowMs - elapsed) / 1000)} seconds`
      });
    }

    requestCounts[userId].count++;
    next();
  };
};