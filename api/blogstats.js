const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const memoize = require('lodash.memoize'); // Import lodash.memoize

const router = express.Router();

// Define a custom caching function using lodash.memoize
const customCache = (fn, time) => {
  const cache = new Map();
  return memoize((...args) => { // Use memoize here
    const key = args.join('-');
    const cachedData = cache.get(key);
    if (cachedData && Date.now() - cachedData.timestamp < time) {
      return cachedData.result;
    }
    const result = fn(...args);
    cache.set(key, { result, timestamp: Date.now() });
    return result;
  });
};

// Middleware to fetch and analyze blog data
const fetchAndAnalyzeBlogs = async () => {
  try {
    const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
      headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
      }
    });

    const blogs = response.data;

    // Calculate the total number of blogs
    const totalBlogs = blogs.length;

    // Find the blog with the longest title
    const longestBlog = _.maxBy(blogs, 'title.length');

    // Determine the number of blogs with titles containing "privacy"
    const privacyBlogs = _.filter(blogs, (blog) =>
      _.includes(_.toLower(blog.title), 'privacy')
    ).length;

    // Create an array of unique blog titles
    const uniqueBlogTitles = _.uniqBy(blogs, 'title');

    return {
      totalBlogs,
      longestBlogTitle: longestBlog.title,
      privacyBlogs,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title)
    };
  } catch (error) {
    throw error;
  }
};

// Apply caching to the fetchAndAnalyzeBlogs function
const cachedFetchAndAnalyzeBlogs = customCache(fetchAndAnalyzeBlogs, 60000); // Cache for 60 seconds

// Middleware to fetch and return cached blog statistics
router.get('/', async (req, res) => {
  try {
    const cachedData = await cachedFetchAndAnalyzeBlogs();

    // Respond with the cached statistics
    res.json(cachedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching and analyzing blog data.' });
  }
});

module.exports = router;
