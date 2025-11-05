# Powerlytics Backend (Express + MongoDB)

This backend powers the Energy Consumption Dashboard. It uses Express and Mongoose, connects to MongoDB Compass using a database named `energy`, and exposes simple REST APIs to store and retrieve users, predictions, and reports.

## Quick start

1. Create your environment file from the template:

```
Copy .env.example .env
```

Then adjust `MONGODB_URI` if your Compass connection string differs. The default connects to a local MongoDB instance at:

```
mongodb://127.0.0.1:27017/energy
```

2. Install dependencies:

```
npm install
```

3. Run the server (dev):

```
npm run dev
```

Server will start at `http://localhost:4000` and connect to the `energy` database. Collections used: `users`, `predictions`, `reports`.

## API endpoints

Base URL: `http://localhost:4000/api`

- Health: `GET /api/health`

### Users
- Create: `POST /api/users`
- List: `GET /api/users`
- Get by id: `GET /api/users/:id`
- Update: `PUT /api/users/:id`
- Delete: `DELETE /api/users/:id`
- Get by email: `GET /api/users/by-email/:email`

Sample body:
```
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+250...",
  "houseLocation": "Kigali, Rwanda",
  "profileImage": ""
}
```

### Predictions
- Create: `POST /api/predictions`
- List (optional filters: `ownerId`, `userId`): `GET /api/predictions`
- Get one: `GET /api/predictions/:id`

Posting a prediction with household/appliance data will also create a snapshot in the `reports` collection automatically.

Expected body mirrors the frontend `Predictions` type; minimal example:
```
{
  "ownerId": "hh-123",
  "consumption": "123.45",
  "bill": "45000",
  "tariffBracket": "T2",
  "budgetStatus": "over_budget",
  "budgetDifference": 5000,
  "message": "Budget exceeded",
  "appliances": [
    { "name": "Refrigerator", "consumption": "45.5", "bill": "12000", "percentage": "37.0", "powerWatts": 150 }
  ],
  "householdData": { "region": "Kigali", "incomeLevel": "Medium", "householdSize": 4, "monthlyBudget": 40000 },
  "timestamp": "2025-10-28T12:00:00.000Z",
  "total_kwh": 123.45,
  "total_bill": 45000,
  "report_id": "RPT-abc123",
  "ai_recommendations": []
}
```

### Reports
- Create: `POST /api/reports`
- List (filters: `ownerId`, `userId`, `limit`): `GET /api/reports`
- Get one: `GET /api/reports/:id`

Typical report body mirrors the frontend `Report` interface.

## CORS

By default the API allows requests from `http://localhost:5173` (Vite dev server). You can override using `ORIGIN` in `.env`.

## Folder structure
```
Backend/
  src/
    models/ (Mongoose models)
    routes/ (Express routers)
    utils/  (db + error helpers)
    server.js (app bootstrap)
```

## Notes
- Mongoose uses the `energy` database and explicit collections `users`, `predictions`, and `reports`.
- If MongoDB is running in Docker or a different port/host, set `MONGODB_URI` accordingly.