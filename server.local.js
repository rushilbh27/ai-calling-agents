const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

let clients = [];

app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });

  // initial ping so client knows connection is open
  res.write(`event: ping\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`);
});

// webhook endpoint to receive "Calling complete"
app.post('/api/webhook/complete', (req, res) => {
  const body = req.body || {};
  if (body.message && body.message === 'Calling complete') {
    // notify all connected SSE clients
    const payload = JSON.stringify(body);
    clients.forEach(c => c.res.write(`event: callsComplete\ndata: ${payload}\n\n`));
    return res.json({ status: 'ok' });
  }
  return res.status(400).json({ status: 'invalid payload' });
});

// serve static files (index.html)
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Local server listening on http://localhost:${PORT}`));
