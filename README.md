
# 🚀 Prepify - AI-Powered Exam Simulator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)
![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Tailwind](https://img.shields.io/badge/Style-TailwindCSS%20v4-38B2AC)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-white)

**Prepify** is an intelligent study platform that bridges the gap between passive reading and active testing. By uploading PDF course materials, Prepify uses advanced AI to instantly generate structured quizzes, complete with explanations, difficulty settings, and a gamified "lives" system.

## ✨ Key Features

* **📄 AI Quiz Generation**: Upload any PDF (up to 5MB), and our AI (powered by OpenRouter/Gemini/Llama) parses the text to create a structured JSON exam.
* **⚔️ Multiplayer Arena**:
    * **Real-Time Battles**: Host or join game rooms using 4-digit codes.
    * **Live Leaderboard**: Compete with friends in real-time.
    * **Speed Bonus**: Earn extra points for answering quickly.
* **🎮 Gamified Learning**:
    * **Heart System**: Users start with 3 hearts. Incorrect answers cost a heart.
    * **XP & Store**: Earn XP for correct answers and use it to buy back hearts in the store.
    * **Regeneration**: Hearts regenerate automatically over time (2 minutes per heart).
* **⚙️ Adaptive Configuration**: Choose your subject type (Major, Minor, GED), difficulty level, and number of questions.
* **📊 Interactive Dashboard**: View recent exams, track progress, and manage your quiz library.
* **🎨 Modern Aesthetics**: A fully responsive Cyberpunk/Neon-Dark interface built with Tailwind CSS v4.
* **🔐 Secure Authentication**: JWT-based authentication with Bcrypt password hashing.

## 🛠️ Tech Stack

### Client
* **Framework**: React 19 (Vite)
* **Styling**: Tailwind CSS v4
* **Routing**: React Router DOM v7
* **Real-time**: Socket.IO Client
* **HTTP Client**: Axios
* **Icons**: Lucide React

### Server
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: PostgreSQL (`pg`)
* **Real-time**: Socket.IO
* **AI Integration**: OpenRouter API (Accessing models like Gemini Flash, Llama 3, Deepseek)
* **File Handling**: Multer (Memory Storage) & PDF2JSON
* **Validation**: Zod

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL installed and running locally or in the cloud (e.g., Neon, Supabase).

### 1. Clone the Repository
```bash
git clone [https://github.com/bagunasjohnrey/prepify.git](https://github.com/bagunasjohnrey/prepify.git)
cd prepify
````

### 2\. Database Setup

Create a PostgreSQL database and run the following SQL commands to set up the necessary tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    hearts INTEGER DEFAULT 3,
    xp INTEGER DEFAULT 0,
    last_heart_update TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course VARCHAR(100),
    difficulty VARCHAR(50),
    description TEXT,
    questions JSONB NOT NULL,
    items_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id),
    user_id INTEGER REFERENCES users(id),
    score INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3\. Backend Setup

Navigate to the root directory, install dependencies, and configure the environment.

```bash
npm install
```

Create a `.env` file in the root directory:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/your_db_name
JWT_SECRET=your_secure_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

Start the server:

```bash
npm run dev
```

### 4\. Frontend Setup

Open a new terminal, navigate to the client folder, and install dependencies.

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

Start the client:

```bash
npm run dev
```

Visit `http://localhost:5173` to view the app.

## 📂 Project Structure

```
prepify/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI (Buttons, Inputs, Modals)
│   │   ├── context/        # Auth Context
│   │   ├── layout/         # Navbar, Footer
│   │   ├── pages/          # Dashboard, Quiz, Multiplayer, etc.
│   │   └── utils/          # API & Socket configuration
│   └── vite.config.js
├── server/                 # Express Backend
│   ├── config/             # Database connection
│   ├── controllers/        # Logic for Auth, Quizzes, Game State
│   ├── middleware/         # Auth verification & File Uploads
│   ├── models/             # DB Queries (User, Quiz)
│   ├── routes/             # API Routes
│   └── utils/              # AI Service, PDF Parser, Heart System
└── package.json
```

## 🤖 AI Model Configuration

The application uses **OpenRouter** to fetch questions. By default, it attempts to use free models in the following order (defined in `server/utils/aiService.js`):

1.  Google Gemini 2.0 Flash
2.  Meta Llama 3.3
3.  Deepseek R1
4.  OpenAI GPT-OSS

Ensure your `OPENROUTER_API_KEY` has access to these models.

## 🤝 Contributing

Contributions are welcome\! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## 📝 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).

-----

*Made with 💙 by [John Rey Bagunas](https://github.com/BagunasJohnrey)*
