// Vercel Serverless Function to reset sales completion state (Redis)
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;
let redis;
function getRedis() {
  if (!redis) {
    if (!redisUrl) throw new Error('REDIS_URL not configured');
    redis = new Redis(redisUrl);
  }
  return redis;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const r = getRedis();
    await r.del('sales_calls_complete');
    return res.status(200).json({ status: 'reset' });
  } catch (err) {
    console.error('Redis del error', err);
    return res.status(500).json({ error: 'redis-del-failed' });
  }
};
