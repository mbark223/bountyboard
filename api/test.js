module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'Hello from JavaScript!',
    timestamp: new Date().toISOString()
  });
};