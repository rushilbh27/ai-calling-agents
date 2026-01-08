// Vercel Serverless Function to receive completion webhook at /api/webhook/complete (Redis)
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

  const body = req.body || {};

  // Accept payload { message: 'Calling complete' } and persist completion in Redis
  if (body.message === 'Calling complete') {
    try {
      const r = getRedis();
      await r.set('calls_complete', JSON.stringify({ done: true, at: Date.now() }));
      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      console.error('Redis set error', err);
      return res.status(500).json({ error: 'redis-set-failed' });
    }
  }

  return res.status(400).json({ error: 'Invalid payload' });
};
