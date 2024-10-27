# Real-Time Weather Monitoring System

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
  - [Starting the Backend Server](#starting-the-backend-server)
  - [Starting the Frontend Server](#starting-the-frontend-server)
- [Starting with Docker](#Starting-with-Docker) 
- [Weather API Integration](#weather-api-integration)
- [Contact Information](#contact-information)

---

## Introduction

The **Real-Time Weather Monitoring System** continuously monitors weather data in real-time using the [OpenWeatherMap API](https://openweathermap.org/api) (One Call API 3.0). It retrieves weather data for key metros in India (Delhi, Mumbai, Chennai, Bangalore, Kolkata, Hyderabad), processes it to generate daily summaries, and triggers alerts based on user-defined thresholds.

---

## Features

- **Real-time Weather Data Retrieval**: Fetch live weather data at configurable intervals (e.g., every 5 minutes) for specified locations.
- **Daily Weather Summaries**: Calculate and store daily weather aggregates (e.g., average temperature, max/min temperature, dominant weather condition).
- **User-Defined Alerts**: Define alert thresholds for temperature and weather conditions, triggering alerts when conditions are met.
- **Data Visualizations**: Display daily summaries, historical trends, and triggered alerts using graphical representations.

---

## Architecture

The application uses a **Client-Server** architecture:

- **Frontend**: Built using React.js and Recharts for visualizations.
- **Backend**: Developed using Node.js and Express.js, handling data retrieval, processing, and alerting.
- **Database**: MongoDB for persistent storage of weather summaries.

---

## Prerequisites

Ensure the following software is installed:

- **Node.js** (v20.x or later)
- **npm** (v10.x or later)
- **MongoDB** (v4.x or later)
- **Git**
- **OpenWeatherMap API Key (One Call API 3.0)** (You can get one from [here](https://openweathermap.org/api))

---

## Installation

### Backend Setup

1. **Clone the Repository**

    ```bash
    git clone https://github.com/snoopdeep/Real-Time-Weather-Monitoring.git
    ```
    ```bash
    cd Real-Time-Weather-Monitoring.git/backend
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Configure Environment Variables**

    In the `.env` file inside the `backend` directory, add your MongoDB connection URL and OpenWeatherMap API key:

    ```bash
    MONGODB_URI=your_mongodb_connection_string
    OPENWEATHER_API_KEY=your_openweather_api_key
    ```

### Frontend Setup

1. **Navigate to the Frontend Directory**

    ```bash
    cd ../frontend
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

---

## Running the Application

### Starting the Backend Server

From the `backend` directory, run:

```bash
npm start
```

This will start the backend server on ```http://localhost:5000``` (default port can be configured).


### Starting the Frontend Server

From the `frontend` directory, run:
```bash
npm run dev
```
This will start the frontend development server on ```http://localhost:3000```.

---


Starting with Docker
-----
I assume you have installed Docker and it is running.

See the [Docker website](http://www.docker.io/gettingstarted/#h_installation) for installation instructions.

**Environment Variables:** Ensure .env variables (e.g., MONGODB_URI, OPENWEATHER_API_KEY) are configured correctly in backend/.env.


Build
-----
Run the following command to build and start the containers:
```bash
docker-compose up --build
```

Once everything has started up, you should be able to access the webapp via [http://localhost:3000/](http://localhost:3000/) on your host machine.
```bash
http://localhost:3000/
```

To stop the services, use:

```bash
docker-compose down
```

---

## Weather API Information

This project utilizes the **OpenWeather One Call API 3.0** to provide accurate and up-to-date weather information, including:

### API Subscription and Usage
To use this API, you’ll need to **sign up** and **subscribe** on the [OpenWeather website](https://openweathermap.org/api) to receive an API key. Note that the free tier allows up to **1,000 API calls per day**; usage beyond this limit incurs a small fee (0.0012 GBP per extra call).

For more details on the One Call API and its subscription plans, refer to the [API Documentation](https://openweathermap.org/api/one-call-3).

Please ensure your API key is correctly configured in the project for proper functionality.

---

# Contact Information

If you have any questions or would like to reach out, feel free to contact me via the following channels:

- **Email**: [singhdeepak.bengaluru7@gmail.com](mailto:singhdeepak.bengaluru7@gmail.com)
- **Phone No**: [+91 9170520433](9170520433)

