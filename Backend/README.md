# 🧠 Smart Task Manager API

A scalable, secure, and production-ready **Task Management REST API** built with **Node.js**, **Express**, and **MongoDB**, featuring user roles, JWT authentication, activity logs, task tracking, and reminders. Deployed using **Docker** and **CI/CD pipelines on AWS EC2**.

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [Docker Setup](#docker-setup)
- [Deployment (AWS EC2 + CI/CD)](#deployment-aws-ec2--cicd)
- [License](#license)

---

## ✨ Features

- User registration and login with **JWT + refresh tokens**
- **Role-based access**: Admin, Manager, User
- Create, update, delete, assign tasks
- Track task statuses: `todo`, `in-progress`, `done`
- **Activity logs** for all user actions
- **Email reminders** for tasks (cron jobs)
- Secure with rate limiting, validation, and error handling
- **Dockerized** and **CI/CD ready (GitHub Actions / Jenkins)**

---

## 🧰 Tech Stack

| Tech         | Purpose                     |
|--------------|-----------------------------|
| Node.js      | Backend runtime             |
| Express.js   | Web framework               |
| MongoDB      | NoSQL database              |
| Mongoose     | MongoDB ODM                 |
| JWT          | Authentication              |
| Docker       | Containerization            |
| GitHub Actions/Jenkins | CI/CD              |
| AWS EC2      | Cloud deployment            |
| Nodemailer   | Email notifications         |
| Joi / Zod    | Request validation          |
| Winston      | Logging                     |

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js >= 18.x
- MongoDB (local or Atlas)
- Docker (for containerization)
- AWS EC2 (for deployment)

### 🛠️ Install Dependencies

```bash
git clone https://github.com/yourusername/task-manager-api.git
cd task-manager-api
npm install
