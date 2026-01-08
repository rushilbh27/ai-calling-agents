// Vercel Serverless Function to receive completion webhook
let statuses = global.__CALL_STATUSES__ || (global.__CALL_STATUSES__ = {});

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  // Expecting { message: 'Calling complete', runId: '...' }
  if (body.message === 'Calling complete' && body.runId) {
    statuses[body.runId] = 'complete';
    return res.status(200).json({ status: 'ok' });
  }

  return res.status(400).json({ error: 'Invalid payload' });
};
