require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
const { dbAsync } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'feedback-lite-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin === true) {
    return next();
  } else {
    // If it's an API request, return JSON error
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // If it's a page request, redirect to login
    return res.redirect('/admin/login');
  }
}

// Serve HTML pages
app.get('/', (req, res) => {
  res.redirect('/submit');
});

app.get('/submit', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'submit.html'));
});

// Admin login page (public)
app.get('/admin/login', (req, res) => {
  // If already logged in, redirect to admin panel
  if (req.session && req.session.isAdmin === true) {
    return res.redirect('/admin');
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Admin panel (protected)
app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Authentication API Endpoints

// POST /api/login - Admin login
app.post('/api/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (password === adminPassword) {
      req.session.isAdmin = true;
      res.json({
        success: true,
        message: 'Login successful'
      });
    } else {
      // Add a small delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/logout - Admin logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// API Endpoints

// POST /api/feedback - Save new feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Feedback text is required' });
    }

    const result = await dbAsync.run(
      'INSERT INTO Feedback (text) VALUES (?)',
      [text.trim()]
    );

    res.status(201).json({
      success: true,
      id: result.id,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// GET /api/feedback - List all feedback (protected)
app.get('/api/feedback', requireAuth, async (req, res) => {
  try {
    const feedbacks = await dbAsync.all(
      'SELECT id, text, created_at, status FROM Feedback ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: feedbacks,
      count: feedbacks.length
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// GET /api/feedback/:id - Get specific feedback details (protected)
app.get('/api/feedback/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    const feedback = await dbAsync.get(
      'SELECT id, text, created_at, status FROM Feedback WHERE id = ?',
      [id]
    );

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// PUT /api/feedback/:id - Update feedback status (protected)
app.put('/api/feedback/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    if (!status || !['new', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "new" or "resolved"' });
    }

    const result = await dbAsync.run(
      'UPDATE Feedback SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({
      success: true,
      message: 'Feedback status updated successfully'
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// GET /api/insights - Generate AI insights from feedback (protected)
app.get('/api/insights', requireAuth, async (req, res) => {
  try {
    // Fetch all feedback texts from database
    const feedbacks = await dbAsync.all(
      'SELECT text FROM Feedback ORDER BY created_at DESC'
    );

    if (feedbacks.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: "No feedback available to analyze yet.",
          clusters: []
        }
      });
    }

    const feedbackTexts = feedbacks.map(f => f.text);
    const aiApiKey = process.env.AI_API_KEY;
    
    let insights;
    
    if (aiApiKey) {
      // Try to get AI insights
      try {
        insights = await getAIInsights(feedbackTexts, aiApiKey);
      } catch (aiError) {
        console.warn('AI API failed, falling back to simple analysis:', aiError.message);
        insights = getFallbackInsights(feedbackTexts);
      }
    } else {
      // Use fallback method
      insights = getFallbackInsights(feedbackTexts);
    }

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Helper function to get AI insights
async function getAIInsights(feedbackTexts, apiKey) {
  const prompt = `Analyze the following customer feedback and return a JSON response with this exact structure:
{
  "summary": "2-3 sentence overall summary of common feedback themes",
  "clusters": [
    {
      "title": "Theme name",
      "examples": ["feedback example 1", "feedback example 2"]
    }
  ]
}

Feedback to analyze:
${feedbackTexts.map((text, i) => `${i + 1}. ${text}`).join('\n')}

Return only the JSON, no additional text.`;

  // Try OpenAI first
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const content = response.data.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (openaiError) {
    console.log('OpenAI failed, trying Anthropic...', openaiError.response?.status || openaiError.message);
    
    // Try Anthropic as fallback
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      timeout: 30000
    });

    const content = response.data.content[0].text.trim();
    return JSON.parse(content);
  }
}

// Helper function for fallback insights when no AI API is available
function getFallbackInsights(feedbackTexts) {
  // Simple keyword-based clustering
  const keywordClusters = {};
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'a', 'an'];
  
  feedbackTexts.forEach(text => {
    const words = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    words.forEach(word => {
      if (!keywordClusters[word]) {
        keywordClusters[word] = [];
      }
      if (!keywordClusters[word].includes(text)) {
        keywordClusters[word].push(text);
      }
    });
  });
  
  // Get most frequent keywords
  const sortedKeywords = Object.entries(keywordClusters)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 5);
  
  const clusters = sortedKeywords.map(([keyword, examples]) => ({
    title: keyword.charAt(0).toUpperCase() + keyword.slice(1) + ' Related',
    examples: examples.slice(0, 3) // Show max 3 examples
  }));
  
  const totalFeedbacks = feedbackTexts.length;
  const avgLength = Math.round(feedbackTexts.reduce((sum, text) => sum + text.length, 0) / totalFeedbacks);
  
  return {
    summary: `Analyzed ${totalFeedbacks} feedback submissions with an average length of ${avgLength} characters. ${clusters.length > 0 ? `Main topics include: ${clusters.map(c => c.title.replace(' Related', '')).join(', ')}.` : 'No clear patterns identified yet.'} Consider reviewing individual feedback for detailed insights.`,
    clusters
  };
}

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Feedback-Lite server running on http://localhost:${PORT}`);
  console.log(`📝 Submit feedback: http://localhost:${PORT}/submit`);
  console.log(`⚡ Admin panel: http://localhost:${PORT}/admin`);
});