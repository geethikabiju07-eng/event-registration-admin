# Eventora — Event Registration Admin Panel

A responsive MERN application for creating, viewing, updating and deleting event records.

## Features
- Event dashboard with Event ID, name, date, venue and registration total
- Dashboard and Add Event navigation with React Router
- Create, edit and delete events through Express REST APIs
- MongoDB Atlas persistence with Mongoose
- Search events by name, venue, description or displayed ID
- Responsive interface, status messages and empty/loading states

## Project structure
```text
event-registration-admin/
├── frontend/
└── backend/
```

## Prerequisites
- Node.js (LTS recommended) and npm
- A MongoDB Atlas deployment and database user
- Git (for repository upload)

## Configure the backend
1. In `backend/.env`, set `PORT=5000`.
2. Replace the sample `MONGODB_URI` with your own MongoDB Atlas connection string.
3. In the Atlas Network Access settings, allow your development machine to connect.

Install and run:
```bash
cd backend
npm install
npm run dev
```

The backend starts at `http://localhost:5000` after connecting to MongoDB Atlas.

## Configure the frontend
In `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

In a second terminal:
```bash
cd frontend
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## API routes
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/events` | List all events |
| GET | `/api/events/:id` | Get one event |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |

## Registration count note
The `totalRegistrations` value starts at zero. This assignment's required form does not include an attendee-registration workflow, so the application displays the stored count but does not invent attendee records.

## GitHub and environment configuration
The `.env` files in this starter project contain placeholders/local settings, not real Atlas credentials. Replace the backend URI locally to run the app. Never publish personal or production credentials in a public repository. If an evaluator needs a live database, coordinate a test-only account and share access using the submission instructions; rotate test credentials after evaluation.

## Before submission
- Verify create, read, update and delete against MongoDB Atlas.
- Run `npm run build` in `frontend`.
- Ensure both `frontend/` and `backend/` are committed.
- Add your author details and repository URL if required by your assessment.
