# Cancer Awareness & Support Web Application

A simple and responsive **Cancer Awareness & Support** web application built using **React**. This project was created as part of a technical assessment to demonstrate frontend development skills, component-based architecture, API integration, and responsive design.

---

## 🌟 Features

* 🎗️ **Landing Page** with a clear awareness message and banner image
* ✉️ **Contact Form** (Name, Email, Message) with client-side validation (no backend required)
* 💬 **Real-time Motivational Quotes** fetched from a public API
* 📱 **Responsive Design** that works across desktop and mobile devices
* ⚛️ Built using **React (Vite)** and modern JavaScript

---

## 🛠 Tech Stack

* **Frontend:** React (with Vite)
* **Styling:** Plain CSS
* **API:** Public Quotes API ([https://api.quotable.io](https://api.quotable.io))
* **Deployment:** Netlify / Vercel / GitHub Pages

---

## 📁 Project Structure

```
cancer-awareness/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   └── components/
│       ├── Hero.jsx
│       ├── ContactForm.jsx
│       └── Quotes.jsx
```

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/cancer-awareness.git
cd cancer-awareness
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## 🌐 API Used

* **Quotable API** – Fetches random motivational quotes in real time

Example endpoint:

```
https://api.quotable.io/random
``

---

## 📦 Build for Production

```bash
npm run build
```

This will generate a `dist` folder that can be deployed to any static hosting service.

---

## ☁️ Deployment

This project can be deployed easily using:

* **Netlify** (recommended)
* **Vercel**
* **GitHub Pages**

For Netlify:

1. Run `npm run build`
2. Upload the `dist` folder to Netlify

---

## 🎯 Purpose of the Project

This project was developed to:

* Demonstrate understanding of **React fundamentals**
* Show **component-based UI design**
* Implement **API integration using hooks**
* Build a clean and **responsive frontend interface**

---

## 📌 Future Enhancements

* Add backend support using **Node.js & Express**
* Store contact form submissions in **MongoDB**
* Add a **donation tracking dashboard**
* Improve UI using **Tailwind CSS or Material UI**

---

## 👤 Author

**Keshu Vardhan Vuddanti**
Aspiring MERN Stack Developer

---

## 📄 License

This project is open-source and available for learning and demonstration purposes.

---

⭐ If you found this project useful, feel free to give it a star!
