🏡 Airbnb Clone - Full-Stack Property Booking Platform

A comprehensive, full-stack web application inspired by Airbnb, built with Node.js, Express, MySQL, and EJS. This project demonstrates a robust architecture with distinct roles for Hosts and Guests, interactive map integrations, and a strong emphasis on web security.

✨ Key Features

Dual User Roles (RBAC): Distinct workflows and dashboards for Guests (booking properties) and Hosts (managing properties).

Multi-Step Host Onboarding: A smooth, 5-step property listing wizard including room configurations, dynamic pricing, and image uploads.

Interactive Mapping & Geocoding: Integrated with Leaflet.js and Nominatim OpenStreetMap API for free, accurate location pinning and reverse geocoding—without relying on paid Google APIs.

Security-First Approach:

CSRF Protection: Synchronized token pattern using csrf-sync.

Rate Limiting: IP-based request limiting via express-rate-limit to prevent brute-force and DDoS attacks.

Secure Passwords: Hashed and salted with bcryptjs.

ID Obfuscation: Database IDs are hidden from the frontend using hashids to prevent IDOR attacks and data scraping.

Session Management: Persistent, database-backed sessions using express-mysql-session.

Automated Cron Jobs: Background tasks to automatically clean up expired or abandoned pending bookings.

🛠️ Tech Stack

Frontend: EJS (Embedded JavaScript templates), Custom CSS, Leaflet.js

Backend: Node.js, Express.js

Database: MySQL (using mysql2 with connection pooling)

File Handling: Multer (for multipart/form-data image uploads)

🚀 Getting Started

Prerequisites

Node.js (v16+)

MySQL Server

1. Clone the repository

git clone https://github.com/yourusername/airbnb-clone.git
cd airbnb-clone


2. Install dependencies

npm install


3. Environment Variables

Create a .env file in the root directory and add the following configuration. (See .env.example if provided):

PORT=4000
host='localhost'
user='root'
password='your_mysql_password'
database='airbnb_db_copy'
secret='your_super_secret_session_key'
name='session_cookie'
destination='uploads/'
hash_key='your_random_hashid_secret'


4. Database Setup

Open your MySQL client (e.g., MySQL Workbench).

Create the database: CREATE DATABASE airbnb_db_copy;

Run the SQL queries provided in sql_quries.js (or your init script) to create the USERS, HOSTS, HOMES, BOOKINGS, LOCATION, and PROPERTY_IMAGES tables.

5. Start the Application

# For development (using nodemon)
npm start

# The server will run on http://localhost:4000


📂 Project Structure

├── controller/          # Route handlers (auth, host, user, api)
├── models/              # Database models and queries
├── public/              # Static assets (CSS, client-side JS)
├── routes/              # Express route definitions
├── utils/               # Helpers (Multer, Rate Limiter, CSRF, Hashids)
├── views/               # EJS Templates (Partials, Auth, Host, User)
├── app.js               # Application entry point
└── .env                 # Environment variables (ignored in git)


🔮 Future Improvements

Cloud Storage: Migrate local multer uploads to Cloudinary or AWS S3 to support ephemeral file systems on cloud hosts (like Render/Heroku).

Message Queue: Move the setInterval booking cleanup task to a dedicated background worker (e.g., Redis + BullMQ) for better horizontal scaling.

Payment Integration: Implement Stripe for processing actual checkout transactions.
