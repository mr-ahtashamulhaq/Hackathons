# 📝 Feedback Lite

A minimal, powerful feedback collection web application with AI-powered insights. Built with Node.js, Express, and SQLite.

## ✨ Features

- **Simple Feedback Collection**: Clean, user-friendly feedback submission form
- **Admin Dashboard**: Secure admin panel to manage feedback
- **AI-Powered Insights** 🧠: Automatic analysis of feedback themes and patterns
- **Smart Fallback**: Works with or without AI APIs using keyword-based clustering
- **Real-time Management**: Mark feedback as resolved/new, view detailed feedback
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Authentication**: Session-based admin authentication

## 📊 API Endpoints

### Public Endpoints
- `POST /api/feedback` - Submit new feedback

### Protected Endpoints (Admin only)
- `GET /api/feedback` - List all feedback
- `GET /api/feedback/:id` - Get specific feedback
- `PUT /api/feedback/:id` - Update feedback status
- `GET /api/insights` - Generate AI insights from feedback

### Authentication Endpoints
- `POST /api/login` - Admin login
- `POST /api/logout` - Admin logout

## 🧠 AI Insights Feature

The application includes an intelligent feedback analysis system:

### With AI API Key
- Supports **OpenAI** (GPT-3.5-turbo) and **Anthropic** (Claude) APIs
- Generates sophisticated summaries and theme clustering
- Provides contextual insights and patterns

### Without AI API Key (Fallback)
- Uses keyword-based clustering algorithm
- Groups feedback by common meaningful terms
- Generates statistical summaries

### Supported AI Providers
- **OpenAI**: Set `AI_API_KEY` to your OpenAI API key
- **Anthropic**: Set `AI_API_KEY` to your Anthropic API key

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahtasham-official/feedback-lite.git
   cd feedback-lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your configuration:
   ```env
   PORT=3000
   ADMIN_PASSWORD=your-secure-admin-password
   SESSION_SECRET=your-random-session-secret-key
   AI_API_KEY=your-openai-or-anthropic-api-key-here  # Optional
   NODE_ENV=production
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Access the application**
   - User feedback form: `http://localhost:3000/submit`
   - Admin panel: `http://localhost:3000/admin`

## Development

For development with auto-reload:
```bash
npm run dev
```

## Database Schema

The application uses a single `Feedback` table:

```sql
CREATE TABLE Feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'resolved'))
);
```

## File Structure

```
feedback-lite/
├── package.json          # Dependencies and scripts
├── server.js            # Main Express server
├── database.js          # Database connection and utilities
├── scripts/
│   └── init-db.js      # Database initialization
├── views/
│   ├── submit.html     # Public feedback form
│   └── admin.html      # Admin dashboard
├── public/
│   └── styles.css      # CSS styling
└── README.md           # This file
```

## Deployment Options

### Option 1: Node.js Server (Heroku, Railway, etc.)

1. Set environment variables:
   ```bash
   PORT=3000
   NODE_ENV=production
   ```

2. The database will be created automatically on first run.

### Option 2: Traditional Web Hosting

1. Ensure Node.js is supported
2. Upload all files
3. Install dependencies: `npm install --production`
4. Initialize database: `npm run init-db`
5. Start: `npm start`

### Option 3: Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run init-db
EXPOSE 3000
CMD ["npm", "start"]
```

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

### Customization

- **Styling**: Modify `public/styles.css`
- **Database**: The SQLite database file (`feedback.db`) is created automatically
- **Pages**: Update HTML in `views/` directory
- **API**: Extend endpoints in `server.js`

## Security Considerations

For production deployment:

1. **Input Validation**: Already implemented for text length and required fields
2. **SQL Injection**: Protected using parameterized queries
3. **XSS Protection**: HTML is escaped in the frontend
4. **HTTPS**: Configure reverse proxy (nginx) or hosting platform for SSL
5. **Admin Access**: Consider adding authentication for `/admin` route

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- JavaScript required for form submission and admin panel

## License

MIT License - feel free to use and modify as needed.

## Support

This is a minimal application designed for simplicity. For additional features, consider:

- User authentication
- Email notifications
- Export functionality  
- Advanced filtering and search
- File attachments
- Multi-language support