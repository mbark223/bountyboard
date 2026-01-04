export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { briefId } = req.query;
  
  if (!briefId) {
    return res.status(400).json({ error: 'briefId is required' });
  }
  
  // Return empty array for now to test if the endpoint works
  console.log('[Admin Submissions Minimal] Request for briefId:', briefId);
  
  res.status(200).json([]);
}