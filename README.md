# AAYUSHMAN – Rural Healthcare Platform

**Healthcare, Closer to You.**

AAYUSHMAN is a full-stack healthcare platform designed to make healthcare services more accessible to people in rural and underserved communities. It brings patients, doctors, pharmacies, ambulance operators, and administrators together through a single web application.

🌐 **Live Demo:** https://aayushman-pink.vercel.app/

📂 **GitHub Repository:** https://github.com/krayush1307-art/AAYUSHMAN

---

## About the Project

Accessing healthcare can be challenging for people living in rural areas due to distance, limited medical facilities, and a lack of convenient access to healthcare professionals.

AAYUSHMAN aims to address these challenges by providing a centralized digital platform where users can explore healthcare services, manage appointments, and access healthcare-related information.

The project is developed as a portfolio project and demonstrates full-stack web development, authentication, role-based access, REST API development, and cloud deployment.

## Features

### Patient
- User registration and login
- Patient dashboard
- Browse available doctors
- Book doctor appointments
- View and manage appointments
- Access healthcare information
- AI Health Assistant

### Doctor
- Doctor dashboard
- View patient appointments
- Accept or reject appointment requests
- Update appointment status
- Manage appointment-related information

### Pharmacy
- Pharmacy dashboard
- Pharmacy-related management interface

### Ambulance
- Ambulance operator dashboard
- Ambulance-related service interface

### Admin
- Admin dashboard
- View platform statistics
- Search and manage users
- Activate or deactivate user accounts

### Additional Features
- Role-based authentication and authorization
- JWT-based authentication
- Responsive user interface
- Light and dark themes
- AI Health Assistant integration
- Cloud-based frontend and backend deployment

> **Note:** AAYUSHMAN is currently a portfolio/demo project. Some healthcare services, including ambulance dispatch, medicine fulfillment, and real-time medical consultations, may not be connected to actual service providers. The AI Health Assistant is for general informational purposes and is not a substitute for professional medical advice.

## Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend UI |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| Tailwind CSS | Styling |
| JWT | Authentication |
| Cloudflare Workers | AI assistant integration |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Git & GitHub | Version control |

## Project Structure

```text
AAYUSHMAN/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── config/
│       └── ...
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── ...
│
└── README.md
```

## Getting Started

Follow these steps to run AAYUSHMAN locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or a local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/krayush1307-art/AAYUSHMAN.git
```

```bash
cd AAYUSHMAN
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:5173

CLOUDFLARE_AI_URL=your_cloudflare_ai_worker_url
AI_WORKER_SECRET=your_ai_worker_secret
```

Replace the placeholder values with your own configuration.

**Never upload your `.env` file or secret credentials to GitHub.**

### 4. Start the backend

Inside the `server` directory, run:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

Backend health check:

```text
http://localhost:5000/api/health
```

### 5. Install frontend dependencies

Open a new terminal:

```bash
cd AAYUSHMAN/client
npm install
```

### 6. Configure frontend environment variables

Create a `.env` file inside the `client` directory.

```env
VITE_API_URL=http://localhost:5000/api
```

### 7. Start the frontend

Inside the `client` directory, run:

```bash
npm run dev
```

Open the local development URL shown in your terminal, usually:

```text
http://localhost:5173
```

## Deployment

AAYUSHMAN is deployed using cloud hosting services.

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| AI Integration | Cloudflare Workers |

The frontend and backend are deployed independently and communicate through the configured API URL.

## Future Improvements

- Integration with verified local healthcare providers
- Real-time ambulance availability and tracking
- Medicine ordering with verified pharmacies
- Secure online doctor consultations
- Improved multilingual voice assistance
- More healthcare resources for rural communities
- Location-based healthcare service discovery

## Disclaimer

AAYUSHMAN is an educational and portfolio project intended to demonstrate full-stack development.

It does not provide emergency medical services, guaranteed ambulance dispatch, verified medicine delivery, or professional medical diagnosis. In an emergency, contact your local emergency services or visit the nearest appropriate medical facility.

---

## Author

**Ayush**

Full-Stack Web Development Project

GitHub: https://github.com/krayush1307-art

---

*Built with the goal of bringing healthcare closer to rural communities.*
