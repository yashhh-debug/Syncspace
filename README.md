# 🚀 SyncSpace – Real-Time Collaborative Whiteboard & Code Editor

> A modern collaborative workspace that enables multiple users to write code, draw on a shared whiteboard, and collaborate in real time using CRDT-based synchronization.

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Express](https://img.shields.io/badge/Backend-Express-000000?logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![WebSocket](https://img.shields.io/badge/Realtime-WebSocket-orange)
![Yjs](https://img.shields.io/badge/Collaboration-Yjs-blueviolet)

---

# 📖 Overview

SyncSpace is a collaborative web application that combines a real-time code editor and an interactive whiteboard into a single workspace. It allows multiple users to collaborate simultaneously with seamless synchronization using WebSockets and Yjs (CRDTs), ensuring conflict-free editing and a smooth collaborative experience.

---

## 🏗 Architecture

```
Client (React + Monaco + Konva)
          │
          │ REST API
          ▼
Backend (Express.js)
          │
          ▼
MongoDB

Realtime Collaboration
Client ◄────────► WebSocket Server ◄────────► Client
                    (Yjs)
```
# ✨ Features

- 🔐 Secure user authentication
- 👥 Multi-user collaboration
- ⚡ Real-time synchronization using WebSockets
- 🧠 Conflict-free editing using Yjs (CRDT)
- 💻 VS Code-like code editor powered by Monaco Editor
- 🎨 Interactive collaborative whiteboard using React Konva
- 🔄 Simultaneous drawing and coding
- 📂 Workspace management
- 🚀 Fast and responsive React interface
- 📡 RESTful backend APIs
- 🗄 MongoDB database integration
- 🔒 JWT-based authentication
- 📱 Responsive design

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- React Router
- Monaco Editor
- React Konva
- Axios

## Backend

- Node.js
- Express.js
- WebSocket (ws)
- Yjs
- y-websocket
- JWT Authentication
- Cookie Parser
- Nodemailer

## Database

- MongoDB
- Mongoose

---

# 📂 Project Structure

```
SyncSpace/
│
├── client/                 # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # Express Backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── index.js
│   └── package.json
│
├── package.json            # Workspace configuration
├── package-lock.json
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## Clone the repository

```bash
git clone https://github.com/yashhh-debug/SyncSpace.git
```

## Navigate to the project

```bash
cd SyncSpace
```

## Install dependencies

```bash
npm install
```

## Configure environment variables

Create a `.env` file inside the `server` directory and add the required environment variables.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL=your_email
EMAIL_PASSWORD=your_email_password
```

## Run the project

```bash
npm run dev
```

This command starts both the frontend and backend using npm workspaces.

---

# 📸 Screenshots

> Add screenshots here after deployment.

- Home Page
- Collaborative Whiteboard
- Code Editor
- Authentication
- Dashboard

---

# 👥 Team Contributions

| Team Member | Role | Responsibilities |
|-------------|------|------------------|
| **Yash Kamble** | Backend Developer & Repository Manager | Developed backend APIs using Express.js, integrated MongoDB, implemented JWT authentication, developed WebSocket-based real-time collaboration using Yjs and ws, managed the GitHub repository, reviewed pull requests, resolved merge conflicts, coordinated code integration, and maintained the overall project structure. |
| **Raushan Kumar** | Frontend Developer | Designed and developed the React.js frontend, implemented responsive UI, integrated frontend with backend APIs, managed routing, and enhanced user experience. |
| **Aman** | Backend Developer | Assisted in developing REST APIs, authentication, server-side logic, validation, and backend testing. |
| **Madhurima** | Real-Time Collaboration Developer | Worked on collaborative editing features, WebSocket communication, document synchronization, and performance optimization. |
| **Sthiti** | Database Developer | Designed MongoDB schemas, optimized queries, managed database operations, and ensured data consistency. |
| **Member 6** | UI/UX & Quality Assurance | Improved UI/UX, tested application functionality, identified bugs, and performed cross-browser testing. |
| **Member 7** | Documentation & Deployment Support | Prepared project documentation, maintained technical documents, assisted with deployment, presentation preparation, and final project integration. |

---
## 🎯 Core Functionalities

- User Registration & Login
- JWT Authentication
- Secure Session Management
- Real-Time Collaborative Coding
- Shared Whiteboard
- Multi-user Workspace
- Conflict-free Synchronization
- RESTful APIs

# 🚀 Future Enhancements

- Voice chat integration
- Video conferencing
- File sharing
- Collaborative terminal
- AI-powered code suggestions
- Live cursor indicators
- Version history
- Dark/Light theme support
- Export whiteboard as PDF/Image
- Workspace invitations and permissions

## 📊 Project Status

| Property | Status |
|----------|--------|
| **Version** | v1.0.0 |
| **Development Status** | 🟢 Active |
| **Project Type** | Full Stack Collaborative Web Application |
| **Architecture** | Monorepo (Client + Server) |
| **Real-Time Engine** | WebSocket (ws) + Yjs (CRDT) |
| **Frontend** | React.js + Vite |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB |

## 📌 Project Highlights

- 🚀 Real-time collaborative code editor
- 🎨 Shared interactive whiteboard
- 🔒 Secure JWT-based authentication
- 🌐 WebSocket-powered synchronization
- 🧠 Conflict-free editing with Yjs (CRDT)
- 📱 Responsive React frontend
- ⚡ RESTful Express backend
- 🗄️ MongoDB database integration

## 🌐 Live Demo

Frontend: https://your-frontend.vercel.app

Backend API: https://your-backend.onrender.com
---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to your branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📜 License

This project is developed for educational and academic purposes.

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.