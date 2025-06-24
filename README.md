# RealtimeNotificationApp

<p align="center">
  <img src="https://img.shields.io/badge/.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/SignalR-1B1B1B?style=for-the-badge&logo=microsoft&logoColor=white" />
</p>

## 🚀 Project Overview

This project demonstrates a real-time notification system using a **.NET Core API** with **SignalR** for the backend and a **Next.js** application for the frontend. The backend handles sending and storing notifications using **MongoDB**, while the frontend client receives and displays these notifications in real-time.

## ✨ Features

-   **Backend (NotificationService)**
    -   **SignalR Hub (`NotificationHub.cs`):** Manages real-time communication with clients.
    -   **API Controller (`NotificationsController.cs`):** Provides RESTful endpoints to create and manage notifications.
    -   **MongoDB Integration:** Uses MongoDB to persist notification data.
    -   **Service Layer:** Encapsulates business logic for clean architecture.

-   **Frontend (notification-client)**
    -   **Real-time Notifications:** Listens for new notifications from the SignalR hub.
    -   **API Interaction:** Fetches existing notifications and sends requests to create new ones.
    -   **Modern UI:** Built with Next.js 13 and React for a fast and responsive user experience.

## 🛠️ Getting Started

### Prerequisites

-   [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0) or later
-   [Node.js](https://nodejs.org/en/) (which includes npm)
-   [MongoDB](https://www.mongodb.com/try/download/community) instance (local or cloud)

### Backend Setup (NotificationService)

1.  **Navigate to the backend directory:**
    ```sh
    cd NotificationService
    ```
2.  **Configure MongoDB Connection:**
    Open `appsettings.json` and update the `MongoDBSettings` section with your MongoDB connection string and database name.
    ```json
    "MongoDBSettings": {
      "ConnectionString": "your_mongodb_connection_string",
      "DatabaseName": "your_database_name"
    }
    ```
3.  **Run the service:**
    ```sh
    dotnet run
    ```
    The backend API will be running on `http://localhost:5000` (or the port specified in `launchSettings.json`).

### Frontend Setup (notification-client)

1.  **Navigate to the frontend directory:**
    ```sh
    cd notification-client
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Run the development server:**
    ```sh
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

## ⚙️ How It Works

1.  The **Next.js client** establishes a connection to the `NotificationHub` on the .NET backend.
2.  When a new notification is created via the API (e.g., by calling the `POST` endpoint in `NotificationsController`), the `NotificationService` saves it to MongoDB.
3.  The service then invokes a method on the `NotificationHub`.
4.  The `NotificationHub` pushes the new notification to all connected clients (or specific clients if a recipient is specified).
5.  The **Next.js application** receives the notification and dynamically updates the UI in real-time.

## 🚀 Deployment

### Backend

The .NET service can be deployed to any environment that supports .NET Core, such as IIS, Azure App Service, or a Docker container.

### Frontend

The Next.js application can be easily deployed to platforms like Vercel, Netlify, or any Node.js hosting environment.

```sh
# Create a production build
npm run build

# Start the production server
npm run start
```

## 🙌 Contributing

Contributions are welcome! Please feel free to fork the repository, create a new branch for your feature or fix, and submit a pull request.
