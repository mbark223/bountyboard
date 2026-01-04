module.exports = (req, res) => {
  try {
    res.status(200).json({
      message: "API is working - plain JS",
      DATABASE_URL_exists: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString(),
      node_version: process.version
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Unknown error",
      message: "Function crashed"
    });
  }
};