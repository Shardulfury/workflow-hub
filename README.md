# AI-Powered Executive Assistant Suite

**Your personal AI intern that actually works.**

This isn't just another chatbot. It's a smart assistant that helps you **write emails**, **schedule meetings**, and **summarize videos**—but it always asks for your permission before doing anything important. We call this "Human-in-the-Loop," which just means **you stay in control**.

![Dashboard Preview](./dashboard_preview.png)

## ✨ What Can It Do?

*   **📧 Write Better Emails (Gmail & Outlook):**
    *   **Interactive Drafting:** Tell it what to say, and it drafts a professional email in Gmail. You can refine it indefinitely ("Make it shorter", "Fix the tone") before sending.
    *   **Use Outlook?** We have an autonomous agent that sorts your incoming Outlook emails (Billing, Promos, High Priority) and even drafts replies for you automatically.

*   **📅 Book Meetings Without the Headache:**
    *   Tell it: *"Book a meeting with Alex next Tuesday at 2pm."*
    *   It checks your Google Calendar.
    *   If you're busy, it asks: *"2pm is taken. How about 3pm?"*
    *   It handles the invite for you.

*   **� Watch Videos For You:**
    *   Upload a long recording or paste a YouTube link.
    *   Get a neat summary with bullet points in seconds.

## 🛠️ The Technology (Under the Hood)

*   **Brain:** Google Gemini 1.5 Flash (Super fast AI).
*   **Frontend:** React.js (The beautiful dashboard you see).
*   **Backend:** n8n (The engine running locally on your laptop).
*   **Security:** Tailscale (Keeps your data safe while connecting to the web).

## 🚀 Quick Start Guide

Follow these 4 steps to get running.

### 1. Get the Code
```bash
git clone https://github.com/your-username/ai-executive-assistant.git
cd ai-executive-assistant
```

### 2. Start the Website (Frontend)
```bash
npm install
npm run dev
```
*Open the link shown in your terminal (usually http://localhost:5173).*

### 3. Start the Brain (Backend)
You need **n8n** installed.
```bash
n8n start --tunnel
```
*Import the workflow files from the `workflows/` folder into n8n.*

### 4. Connect Them
Create a file named `.env` in the project folder and add your backend URL:
```env
VITE_API_URL=https://your-n8n-url.app/webhook
VITE_ENV=development
```

## 🤝 Contributing

Want to make it better? Feel free to open an issue!

---
*Built with ❤️ by Shardul Ghusar*
