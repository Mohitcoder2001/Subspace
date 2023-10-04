const express = require('express');
const _ = require('lodash');
const memoize = require('lodash.memoize'); // Import lodash.memoize

const router = express.Router();

// Sample blog data (replace with actual data)
const blogs = [
  { id: 1, title: 'Privacy and Security', content: '...' },
  { id: 2, title: 'Data Privacy Concerns', content: '...' },
  // Add more blog objects as needed
];

// Define a custom caching function using lodash.memoize
const customSearchCache = (fn, time) => {
  const cache = new Map();
  return memoize((query) => { // Use memoize here
    const key = query.toLowerCase();
    const cachedData = cache.get(key);
    if (cachedData && Date.now() - cachedData.timestamp < time) {
      return cachedData.result;
    }
    const result = fn(query);
    cache.set(key, { result, timestamp: Date.now() });
    return result;
  });
};

// Middleware for blog search
const searchBlogs = (query) => {
  try {
    // Perform a case-insensitive search on blog titles
    const matchingBlogs = _.filter(blogs, (blog) =>
      _.includes(_.toLower(blog.title), query)
    );

    return matchingBlogs;
  } catch (error) {
    throw error;
  }
};

// Apply caching to the searchBlogs function
const cachedSearchBlogs = customSearchCache(searchBlogs, 60000); // Cache for 60 seconds

// Blog search endpoint
router.get('/', (req, res) => {
  const query = req.query.query.toLowerCase();

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "query" is required.' });
  }

  try {
    // Use cachedSearchBlogs to retrieve or cache search results
    const matchingBlogs = cachedSearchBlogs(query);

    res.json(matchingBlogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during the blog search.' });
  }
});

module.exports = router;
