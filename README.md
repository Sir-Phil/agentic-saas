# 🚀 AI Content Generator SaaS

An AI-powered content generation platform that helps users create high-quality content such as blog posts, tweets, ads, product descriptions, and more — all in real-time using streaming responses.

---

## 🧠 Overview

This project is a **full-stack SaaS application** built with:

* **Frontend**: Next.js (App Router)
* **Backend**: FastAPI (Python)
* **Authentication**: Clerk
* **AI Provider**: OpenRouter (LLM gateway)
* **Streaming**: Server-Sent Events (SSE)

It allows authenticated users to generate different types of content dynamically based on selected templates and topics.

---

## ✨ Features

### 🔐 Authentication

* Secure login/signup via Clerk
* User session management
* Access control for protected routes

### 🤖 AI Content Generation

* Generate multiple content types:

  * Startup Ideas
  * Blog Posts
  * Tweets
  * LinkedIn Posts
  * Ad Copy
  * Product Descriptions
* Dynamic prompt generation based on user input

### ⚡ Real-time Streaming

* AI responses streamed live using SSE
* Smooth user experience similar to ChatGPT

### 🧭 Dashboard UI

* Sidebar with content templates
* Input field for topic
* Streaming output display (Markdown supported)

### 🛡 Error Handling

* Graceful fallback for API errors
* SSE-safe responses (no HTML crashes)

---

## 🏗 Architecture

```
Frontend (Next.js)
   ↓
Clerk Authentication
   ↓
FastAPI Backend (/api)
   ↓
Prompt Engine (type + topic)
   ↓
OpenRouter API
   ↓
Streaming Response (SSE)
```

---

## 📁 Project Structure

```
/app
  ├── page.tsx              # Landing page
  ├── dashboard/page.tsx   # Main SaaS dashboard
/api (FastAPI backend)
  ├── main.py              # API logic

.env.local                 # Environment variables
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd your-project
```

---

### 2. Install dependencies

#### Frontend:

```bash
npm install
```

#### Backend (Python):

```bash
pip install fastapi uvicorn openai fastapi-clerk-auth
```

---

### 3. Environment Variables

Create `.env.local` (Next.js) and `.env` (backend):

```env
# Clerk
CLERK_JWKS_URL=https://your-clerk-domain/.well-known/jwks.json

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key
```

---

### 4. Run the app

#### Start backend:

```bash
uvicorn main:app --reload
```

#### Start frontend:

```bash
npm run dev
```

---

## 🚀 Deployment

### Frontend:

* Deploy using Vercel:

```bash
vercel --prod
```

### Backend:

* Deploy FastAPI using:

  * Vercel Python runtime OR
  * Railway / Render (recommended for stability)

---

## 💡 Usage

1. Sign in via Clerk
2. Navigate to Dashboard
3. Select content type (e.g., Blog, Tweet)
4. Enter topic
5. Click **Generate**
6. Watch AI stream results in real-time

---

## 🔮 Future Improvements

* 💾 Save user-generated content (history)
* 📊 Usage tracking & rate limiting
* 💳 Subscription billing (Stripe integration)
* 🧠 Multi-agent AI workflows (Writer + Editor)
* 📋 Copy & export tools
* 🌐 Public API access

---

## 🛠 Tech Stack

| Layer     | Technology                   |
| --------- | ---------------------------- |
| Frontend  | Next.js, React, Tailwind CSS |
| Backend   | FastAPI (Python)             |
| Auth      | Clerk                        |
| AI        | OpenRouter                   |
| Streaming | Server-Sent Events (SSE)     |

---

## 📜 License

MIT License — feel free to use, modify, and scale.

---

## 🙌 Acknowledgements

* OpenRouter for unified LLM access
* Clerk for authentication
* Vercel for deployment

---

## 🚀 Final Note

This project is a **production-ready AI SaaS foundation**.
You can extend it into a full-scale product by adding persistence, billing, and advanced AI workflows.

---
