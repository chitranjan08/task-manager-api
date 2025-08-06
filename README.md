# 🧠 Smart Task Manager

A full-stack, scalable, and secure **Task Management Application** built with **React (MUI)**, **Node.js**, **Express**, **MongoDB**, and **Kafka**. It includes user roles, JWT authentication, task tracking, activity logs, email reminders, real-time data streaming via Kafka, **social login (Google, Facebook)**, and **rate limiting**. The project is **Dockerized** and ready for **CI/CD on AWS EC2**.

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Social Login](#social-login)
- [Rate Limiting](#rate-limiting)
- [Error Logging](#error-logging)
- [Kafka Integration](#kafka-integration)
- [Docker Setup](#docker-setup)
- [Deployment (AWS EC2 + CI/CD)](#deployment-aws-ec2--cicd)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🔙 Backend
- User registration and login with **JWT + refresh tokens**
- **Social login**: Google, Facebook (OAuth 2.0)
- **Role-based access**: Admin, Manager, User
- CRUD operations for tasks
- Task status tracking (`todo`, `in-progress`, `done`)
- **Activity logs** for audit trail
- **Email reminders** for due tasks (via cron jobs)
- **Real-time data streaming** using **Kafka**
- **Rate limiting** for security and abuse prevention
- Secure APIs with rate limiting and input validation
- **Dockerized** and CI/CD ready

### 🔜 Frontend
- Built with modern **React** and **MUI**
- **Login / Register / Logout** flows
- **Social login** (Google, Facebook)
- **Protected routes** using JWT
- Create, edit, delete, and filter tasks
- View real-time task updates via Kafka stream (e.g., WebSocket or polling Kafka consumer endpoint)
- Responsive UI and smooth UX

---

## 🧰 Tech Stack

| Layer       | Tech Stack                                       |
|-------------|--------------------------------------------------|
| Frontend    | React, MUI, Axios, React Router                  |
| Backend     | Node.js, Express, MongoDB, Mongoose              |
| Auth        | JWT (access + refresh tokens), Passport, OAuth2  |
| Social Auth | Google, Facebook (passport-google-oauth20, passport-facebook) |
| Messaging   | Apache Kafka, KafkaJS                            |
| Validation  | Joi                                              |
| Logging     | Winston                                          |
| Email       | Nodemailer                                       |
| Rate Limiting | express-rate-limit                             |
| DevOps      | Docker, GitHub Actions / Jenkins                 |
| Deployment  | AWS EC2                                          |

---

## 🗂 Project Structure

```
/Backend         # Express.js API, Kafka, MongoDB, Docker, Jenkins
/Frontend        # React + MUI frontend
```

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js (>= 18.x)
- MongoDB (local or Atlas)
- Docker & Docker Compose
- Apache Kafka + Zookeeper (locally or via Docker)
- AWS EC2 (for deployment)
- Google and Facebook OAuth credentials (for social login)

---

### 🔙 Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
KAFKA_BROKER=localhost:9092
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

**Available scripts:**
- `npm run dev` — Start backend in development mode (nodemon)
- `npm run lint` — Lint code
- `npm run lint:fix` — Lint and auto-fix

**Run Kafka locally (if not using Docker):**
```bash
# Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties
# Kafka
bin/kafka-server-start.sh config/server.properties
```

**Start the backend server:**
```bash
npm run dev
```

---

### 🔜 Frontend Setup

```bash
cd Frontend
npm install
```

**Available scripts:**
- `npm start` — Start React development server
- `npm run build` — Build for production
- `npm test` — Run tests
- `npm run eject` — Eject config (irreversible)

**Start the React development server:**
```bash
npm start
```

---

## 🌐 API Endpoints

| Method | Endpoint           | Description           |
|--------|--------------------|----------------------|
| POST   | /auth/register     | Register a new user  |
| POST   | /auth/login        | Login and receive token |
| POST   | /auth/refresh-token| Refresh JWT token    |
| GET    | /auth/google       | Start Google OAuth login |
| GET    | /auth/google-callback | Google OAuth callback |
| GET    | /auth/facebook     | Start Facebook OAuth login |
| GET    | /auth/facebook/callback | Facebook OAuth callback |
| GET    | /tasks             | Get all tasks        |
| POST   | /tasks/create      | Create a task        |
| POST   | /tasks/update      | Update a task        |
| POST   | /tasks/delete      | Delete a task        |
| GET    | /logs/task-logs    | Get activity logs    |
| GET    | /kafka/stream      | Stream Kafka messages (optional) |

---

## 🔑 Social Login

**Supported Providers:**
- Google
- Facebook

**Backend:**
- Uses Passport.js strategies for Google and Facebook OAuth2.
- Endpoints: `/auth/google`, `/auth/facebook` (initiate login), `/auth/google-callback`, `/auth/facebook/callback` (handle callback).
- On success, issues JWT and redirects to frontend with token.

**Frontend:**
- Social login buttons for Google and Facebook in the Auth form.
- Clicking a button redirects to the backend OAuth endpoint.
- On successful login, user is redirected back to `/social-login-success` route with token for authentication.

**Environment Variables:**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` required in backend `.env`.

---

## 🚦 Rate Limiting

**Global Limiter:**
- Applies to all requests: **100 requests per 15 minutes per IP**

**Auth Limiter:**
- Applies to login/register: **5 attempts per 10 minutes per IP**

**Implementation:**
- Uses `express-rate-limit` middleware.
- Returns HTTP 429 with a clear error message if limit is exceeded.

---

## 🪵 Error Logging

**Custom Error Logging System:**
- Uses [Winston](https://github.com/winstonjs/winston) for advanced, centralized logging.
- All errors (including unhandled and custom errors) are logged with timestamp, status code, error code, request path, method, and stack trace.
- Error logs are written to:
  - `logs/error.log` (errors only)
  - `logs/combined.log` (all logs)
- Custom error codes are defined in `Backend/utils/errorCodes.js` for consistent error handling and debugging.
- API error responses are structured as:
  ```json
  {
    "success": false,
    "message": "Error message",
    "errorCode": 1234
  }
  ```
- The error middleware handles validation, database, JWT, and server errors, providing clear messages and codes for frontend consumption.

---

## 📨 Kafka Integration
- Uses **KafkaJS** for Node.js integration.
- Real-time updates for tasks and logs.
- Make sure Kafka and Zookeeper are running before starting the backend.

---

## 🐳 Docker Setup

**Backend:**
- `Backend/Dockerfile` — Defines backend container
- `Backend/docker-compose.yml` — Orchestrates MongoDB and backend

**Quick start:**
```bash
cd Backend
docker-compose up --build
```

---

## 🚀 Deployment (AWS EC2 + CI/CD)
- Use Jenkins or GitHub Actions for CI/CD.
- Deploy Docker containers to AWS EC2.
- Ensure environment variables are set in your deployment environment.

---

## 🛠 Troubleshooting

- **MongoDB connection errors:** Ensure MongoDB is running and URI is correct.
- **Kafka errors:** Make sure both Zookeeper and Kafka are running and accessible.
- **Port conflicts:** Check if ports 3000 (backend), 27017 (MongoDB), and 9092 (Kafka) are free.
- **Docker issues:** Try rebuilding images with `docker-compose build --no-cache`.
- **OAuth errors:** Double-check your Google/Facebook credentials and callback URLs.
- **Rate limit errors:** Wait for the window to reset or check for excessive requests from your IP.
- **Error logs:** Check `logs/error.log` and `logs/combined.log` in the backend for detailed error information and debugging.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.