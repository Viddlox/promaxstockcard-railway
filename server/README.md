
---

# Promax Stock Card - Environment Setup Guide

## Prerequisites

Before you start, ensure you have the following installed on your machine:
- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **pgAdmin4** (for database management)

## Tech Stack

- **Node.js** - JavaScript runtime for the backend.
- **Express.js** - Web framework for Node.js.
- **Prisma** - ORM for database interactions.
- **PostgreSQL** - Relational database management system.
- **Nodemon** - Tool to automatically restart the server during development.
- **Body-Parser** - Middleware for parsing incoming request bodies.
- **Cors** - Middleware for enabling Cross-Origin Resource Sharing.
- **Helmet** - Middleware for securing HTTP headers.
- **Morgan** - HTTP request logger middleware.
- **Concurrently** - Run multiple commands concurrently.
- **dotenv** - Load environment variables from a `.env` file.

## Installation and Setup

Follow these steps to set up your development environment:

### 1. Install PostgreSQL and pgAdmin4
- Download and install **PostgreSQL** from the official website: [https://www.postgresql.org/](https://www.postgresql.org/)
- Install **pgAdmin4** to manage your PostgreSQL database: [https://www.pgadmin.org/](https://www.pgadmin.org/)

### 2. Copy Local Database Properties and Connect to Server
- Set up a local PostgreSQL database.
- Make sure to configure your connection properties (user, password, database name) in the `.env` file (explained in step 6).

### 3. Install Dependencies
- Open a terminal in the project root directory and run:

  ```bash
  npm install
  ```

### 4. Migrate the Database Schema
- Run the following Prisma command to synchronize the schema with your local database:

  ```bash
  npx prisma migrate dev --name init
  ```

  This command will apply the migrations and update your PostgreSQL database schema.

### 5. Seed the Database (Optional)
- If you have seed data, populate the database by running:

  ```bash
  npm run seed
  ```

  This will add the initial data to the database.

### 6. Create a `.env` File
- In the root of the project, create a `.env` file and add the following environment variables:

  ```bash
  PORT=8000
  DATABASE_URL="postgresql://postgres:12341234@localhost:5432/promaxstockcard?schema=public"
  ```

  - `PORT`: The port the server will run on.
  - `DATABASE_URL`: The connection string to your local PostgreSQL database.

### 7. Start the Development Server
- Start the development environment with **nodemon** by running:

  ```bash
  npm run dev
  ```

  This command will launch the development server and auto-restart on file changes.

## Tech Stack

Here's a list of the core dependencies used in the project:

```bash
├── @prisma/client@5.20.0       # Prisma ORM client
├── body-parser@1.20.3          # Middleware to parse request bodies
├── concurrently@9.0.1          # Run multiple commands concurrently
├── cors@2.8.5                  # Middleware for enabling CORS
├── dotenv@16.4.5               # Load environment variables from .env file
├── express@4.21.1              # Web framework for Node.js
├── helmet@8.0.0                # HTTP headers security
├── morgan@1.10.0               # HTTP request logger
├── nodemon@3.1.7               # Auto-restart server on file changes
├── prisma@5.20.0               # ORM for PostgreSQL
└── rimraf@6.0.1                # Utility to clean up files and directories
```

## Database Configuration

Make sure PostgreSQL is running and that you've created a database that matches the `DATABASE_URL` in your `.env` file. You can manage the database using **pgAdmin4** or another PostgreSQL management tool.

## Commands (for debugging purposes only!)

```Sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```
Drops all tables

---