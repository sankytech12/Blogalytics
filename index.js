const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
app.use(express.json());

// Blog Retrieval Endpoint
app.get('/api/blog-stats', async (req, res) => {
  try {
    const blogData = await fetchBlogData(); 
    const analytics = analyzeBlogData(blogData);
    res.json(analytics);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Blog Analysis Function
function analyzeBlogData(blogData) {
    if (!blogData || !blogData.blogs || !Array.isArray(blogData.blogs)) {
      throw new Error('Invalid blog data format');
    }
  
    const blogs = blogData.blogs;
  
    const totalBlogs = blogs.length;
  
    const longestBlog = _.maxBy(blogs, 'title');
  
    const blogsWithPrivacy = _.filter(blogs, (blog) =>
      _.includes(_.toLower(blog.title), 'privacy')
    );
  
    const uniqueTitles = _.uniqBy(blogs, 'title').map((blog) => blog.title);
  
    return {
      totalBlogs,
      longestBlog: longestBlog ? longestBlog.title : null,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueTitles,
    };
  }
  

//Blog Search Endpoint
app.get('/api/blog-search', async (req, res) => {
  const query = req.query.query.toLowerCase();
  try {
    const blogData = await fetchBlogData(); 
    const matchingBlogs = searchBlogs(blogData, query);
    res.json(matchingBlogs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Blog Search function
function searchBlogs(blogData, query) {
    if (!blogData || !blogData.blogs || !Array.isArray(blogData.blogs)) {
      throw new Error('Invalid blog data format');
    }
  
    const blogs = blogData.blogs;
  
    const matchingBlogs = _.filter(blogs, (blog) =>
      _.includes(_.toLower(blog.title), query)
    );
  
    return matchingBlogs;
  }
  
  

//Function to fetch the blogs
async function fetchBlogData() {
  const url = 'https://intent-kit-16.hasura.app/api/rest/blogs';
  const headers = {
    'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
  };

  try {
    const response = await axios.get(url, { headers });
    //console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
}


app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
