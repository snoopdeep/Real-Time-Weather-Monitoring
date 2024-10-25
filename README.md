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

- **Node.js** (v14.x or later)
- **npm** (v6.x or later)
- **MongoDB** (v4.x or later)
- **Git**
- **Docker** (Optional: to containerize the app)
- **OpenWeatherMap API Key** (You can get one from [here](https://openweathermap.org/api))

---

## Installation

### Backend Setup

1. **Clone the Repository**

    ```bash
    git clone https://github.com/snoopdeep/RealTimeWeatherMonitoring.git
    cd RealTimeWeatherMonitoring/backend
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
