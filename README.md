# VbaBrew ☕

**VbaBrew** is a modern, lightweight web tool that generates Excel VBA macros instantly using the power of Groq AI (Llama 3). 

Designed with a clean "Coffee House" aesthetic, it takes natural language instructions and "brews" them into structured, executable VBA code.

## ✨ Features

* **Natural Language to Code:** Simply describe what you need (e.g., *"Delete empty rows and highlight duplicates"*), and get working code.
* **Persistent History:** Log in to save your generated macros and prompts using the **MongoDB Backend**.
* **Smart UI:** Modern, responsive design with "Light/Dark" IDE feel for code.
* **Client-Side Security:** Your Groq API Key is **never** stored on our server (stored locally or entered per session).

## 🚀 Live Demo

[**Click here to visit VbaBrew**](https://vbabrew.vercel.app)

## 🛠️ How to Use

1.  **Get an API Key:**
    * Visit [console.groq.com](https://console.groq.com/keys).
    * Create a free API Key.
2.  **Enter Credentials:**
    * Paste your key into the "Groq API Key" field on the site.
3.  **Brew Code:**
    * Type your request in the text box.
    * Click **Brew Code ☕**.
    * Copy the result into your Excel VBA Editor (`Alt` + `F11`).

## ⚙️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript.
* **Backend:** Node.js, Express, MongoDB Atlas (for user history).
* **AI Engine:** [Groq API](https://groq.com/) running `llama3-70b-8192`.

## ☁️ Deployment on Vercel

This project is configured for seamless deployment on Vercel.

1.  **Push to GitHub**: Ensure this code is in a GitHub repository.
2.  **Import to Vercel**:
    *   Go to [Vercel Dashboard](https://vercel.com/new).
    *   Import your repository.
3.  **Configure Environment**:
    *   In Project Settings > Environment Variables, add:
        *   `MONGODB_URI`: Your MongoDB Atlas connection string.
        *   `JWT_SECRET`: A random string for secure tokens.
4.  **Deploy**: Vercel will automatically detect the `vercel.json` config and deploy the frontend + serverless backend.

## 🔒 Privacy & Security

* **API Keys:** Your Groq API Key is handled client-side and never saved to the database.
* **User Data:** Only your username, password hash, and chat history are stored in MongoDB.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
