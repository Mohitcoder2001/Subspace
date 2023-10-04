const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const blogStatsRouter = require('./api/blogstats');
const blogSearchRouter = require('./api/blogsearch');

app.use(express.json());

app.use('/api/blog-stats', blogStatsRouter);
app.use('/api/blog-search', blogSearchRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
