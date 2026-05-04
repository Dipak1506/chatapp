# 💬 PERN Stack Chat Application

A full-featured real-time chat application built with the **PERN Stack** (**PostgreSQL, Express.js, React.js, Node.js**) featuring secure authentication, Google login, private & group messaging, audio/video calling, and file sharing.

---

## 🚀 Features

* 🔐 User Authentication

  * JWT Authentication
  * Secure Login & Registration
  * Google OAuth Login

* 💬 Real-Time Messaging

  * One-to-One Chat
  * Group Chat
  * Instant Message Updates

* 📁 File Sharing

  * Share Images
  * Share Documents
  * Media Upload Support

* 📞 Calling Features

  * Audio Calling
  * Video Calling
  * Real-Time Communication

* 😊 Additional Features

  * Responsive UI
  * User Search
  * Modern Chat Interface
  * Online User Handling
  * Clean WhatsApp-like Layout

---

# 🛠️ Tech Stack

## Frontend

* React.js
* CSS / Material UI
* Axios
* Socket.io Client

## Backend

* Node.js
* Express.js
* Socket.io
* JWT Authentication

## Database

* PostgreSQL

## Authentication

* Google OAuth 2.0
* JWT

---

# 📂 Project Structure

```bash
chat-app/
│
├── client/                 # React Frontend
│   ├── src/
│   └── public/
│
├── server/                 # Node + Express Backend
│   ├── apis/
│   └── socket/
│
├── screenshots/
│
├── package.json
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/pern-chat-app.git
cd pern-chat-app
```

---

## 2️⃣ Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd backend
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `backend` folder.

```env
PORT=5000

DATABASE_URL=your_postgresql_database_url

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLIENT_URL=http://localhost:3000
```

---

# ▶️ Run Application

## Start Backend

```bash
cd backend
npm start
```

## Start Frontend

```bash
cd client
npm start
```

---

# 🌐 Application URLs

Frontend:

```bash
http://localhost:3000
```

Backend:

```bash
http://localhost:5000
```

---

# 🔥 Core Functionalities

| Feature           | Status |
| ----------------- | ------ |
| Authentication    | ✅      |
| Google Login      | ✅      |
| Real-Time Chat    | ✅      |
| Group Chat        | ✅      |
| File Sharing      | ✅      |
| Audio Call        | ✅      |
| Video Call        | ✅      |
| Responsive Design | ✅      |

---

# 📡 Real-Time Communication

This project uses **Socket.io** for:

* Live Messaging
* Real-Time Notifications
* Audio/Video Call Signaling
* Online User Updates

---

# 🔒 Security Features

* Password Hashing
* JWT Authentication
* Protected Routes
* Secure API Handling

---

# 📈 Future Improvements

* Message Reactions
* Message Seen Status
* Typing Indicators
* Push Notifications
* Screen Sharing
* Message Encryption

---

# 🤝 Contributing

Contributions are welcome.

```bash
Fork the repo
Create your feature branch
Commit your changes
Push to the branch
Create a Pull Request
```

# 👨‍💻 Developer

**Dipak Gohil**

* MERN / PERN Stack Developer
* Real-Time Web Application Enthusiast

---

# ⭐ Support

If you like this project, give it a ⭐ on GitHub.