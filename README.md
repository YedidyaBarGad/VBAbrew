# VbaBrew ☕

**VbaBrew** is a modern, lightweight web tool that generates Excel VBA macros instantly using the power of Groq AI (Llama 3). 

Designed with a clean "Coffee House" aesthetic, it takes natural language instructions and "brews" them into structured, executable VBA code, complete with explanations and safety warnings.

## ✨ Features

* **Natural Language to Code:** Simply describe what you need (e.g., *"Delete empty rows and highlight duplicates"*), and get working code.
* **Structured Output:** The AI returns three distinct sections:
    1.  **The Code:** Clean, commented VBA ready for the Excel Module.
    2.  **The Explanation:** A breakdown of how the logic works.
    3.  **Limitations & Safety:** Crucial warnings about what the code *can't* do or where to be careful.
* **Client-Side Security:** Your API Key is **never** stored on a server. It is sent directly from your browser to Groq's API.
* **Fast & Free:** Uses Groq's ultra-fast inference engine (currently free).
* **Responsive Design:** A modern, brown-and-cream aesthetic that looks good on any screen.

## 🚀 Live Demo

[**Click here to visit VbaBrew**](https://YedidyaBarGad.github.io/VBAbrew/)

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

* **Frontend:** HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+).
* **AI Backend:** [Groq API](https://groq.com/) running `llama3-70b-8192`.
* **Font:** Inter (via Google Fonts).

## 🔒 Privacy & Security

* **No Database:** We do not store your prompts or your API keys.
* **Direct Connection:** The application makes a direct `fetch` request from your browser to the Groq API endpoint.

## 🤝 Contributing

Contributions are welcome! If you have ideas for better prompt engineering or UI improvements:

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
