// Vercel Serverless Function to check call status (reads persisted Redis)
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
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const r = getRedis();
    const v = await r.get('calls_complete');
    if (v) return res.status(200).json({ status: 'complete' });
    return res.status(200).json({ status: 'pending' });
  } catch (err) {
    console.error('Redis read error', err);
    return res.status(500).json({ error: 'redis-read-failed' });
  }
};

