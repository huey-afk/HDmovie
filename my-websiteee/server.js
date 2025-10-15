import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/rdproxy', async (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: 'Missing link parameter' });

  try {
    const rdRes = await fetch('https://api.real-debrid.com/rest/1.0/unrestrict/link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REAL_DEBRID_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ link })
    });

    const data = await rdRes.json();
    if (data.error) return res.status(400).json({ error: data.error });
    res.json({ direct: data.download });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to connect to Real-Debrid' });
  }
});

app.listen(process.env.PORT || 3000, () => 
  console.log(`✅ Server running on http://localhost:${process.env.PORT || 3000}`)
);
