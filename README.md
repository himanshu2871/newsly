# 📰 Newsly

**Newsly** is a modern, personalized AI-powered news aggregator. It delivers curated news articles based on user preferences, offering secure authentication, beautiful layouts, smooth animations, and AI-driven insights directly in the browser.

---

## ✨ Features

- **Personalized News Feed:** Get tailored content by saving preferred topics in your preferences.
- **Smart Filtering:** Browse articles across various categories (Latest, India, Technology, Sports, Finance, etc.).
- **Bookmarking:** Save your favorite articles to read or reference later.
- **Advanced Auth System:** Secure user registration and login enabled using JSON Web Tokens (JWT) and Bcrypt.
- **AI Integrations:** Backend hooked up securely with leading AI provider SDKs (Anthropic, Google Gemini, Groq) to power intelligent content aggregation and summaries.
- **Modern UI/UX:** Responsive design, beautiful glassmorphism aesthetic, stacked typography, and fluid `framer-motion` page transitions.
- **Dark/Light Mode:** Real-time toggling with persistent ambient dynamic background effects.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS V4 + PostCSS
- **Animations:** Framer Motion
- **Routing:** React Router v7
- **HTTP Client:** Axios

### Backend (Server)
- **Environment:** Node.js + Express
- **Database:** PostgreSQL (with `pg` driver)
- **Authentication:** JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **AI Providers:** `@anthropic-ai/sdk`, `@google/generative-ai`, `groq-sdk`
- **Security:** CORS configuration

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and PostgreSQL installed on your machine.

### 1. Clone & Setup
Clone the repository, then install dependencies for both the frontend and backend.

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Environment Variables
Create a `.env` file in the `server/` directory and include the necessary keys:
```env
PORT=3000

# Database
DATABASE_URL=postgres://user:password@localhost:5432/newsly

# Authentication
JWT_SECRET=your_jwt_secret_key

# AI Provider Keys
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Run the Development Servers

You will need to run the client and the server simultaneously in separate terminal windows.

**Start the Backend Server:**
```bash
cd server
node index.js
# Or use nodemon if preferred: npx nodemon index.js
```

**Start the Frontend Application:**
```bash
cd client
npm run dev
```

Your app will be automatically served via Vite (usually on `http://localhost:5173`).

---

## 📁 Project Structure 

```
.
├── README.md
├── client                  # React Frontend
│   ├── public              # Static assets (including the Newsly logo)
│   ├── src
│   │   ├── components      # Reusable UI elements (Navbar, Cards, ThemeToggleButton)
│   │   ├── pages           # Main route views (Home, Login, Register, Bookmarks)
│   │   ├── context         # React Context (Auth, Theme)
│   │   └── services        # API functions
│   ├── index.html          # Web entry point 
│   ├── package.json
│   └── vite.config.js
└── server                  # Express Backend
    ├── index.js            # Main backend entry 
    ├── package.json        
    └── package-lock.json
```

---

## 💡 Upcoming Roadmaps & Development
- Extend AI pipelines to actively summarize lengthy news articles right on the feed.
- Add advanced search indexing.
