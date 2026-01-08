// Vercel Serverless Function to get sales completion status (Redis)
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
  try {
    const r = getRedis();
    const val = await r.get('sales_calls_complete');
    
    if (val) {
      const data = JSON.parse(val);
      if (data && data.done) {
        return res.status(200).json({ status: 'complete' });
      }
    }
    
    return res.status(200).json({ status: 'pending' });
  } catch (err) {
    console.error('Redis get error', err);
    return res.status(500).json({ error: 'redis-get-failed', status: 'pending' });
  }
};
