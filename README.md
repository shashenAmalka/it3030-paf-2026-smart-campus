# Smart Campus Operations Hub

Smart Campus Operations Hub is a full-stack campus management platform for handling:
- Resource discovery and booking
- Maintenance/support tickets with SLA tracking
- Role-based workflows for users, technicians, and admins
- Notifications, login audit, and QR check-in support

## Project Structure

```text
it3030-paf-2026-smart-campus/
├─ backend/   # Spring Boot + MongoDB API
└─ frontend/  # React + Vite client
```

## Tech Stack

### Frontend
- React 19
- React Router 7
- Vite 8
- Axios
- Tailwind CSS (configured in dependencies)
- Leaflet (resource/location map support)

### Backend
- Java 17
- Spring Boot 3.2.4
- Spring Security + OAuth2 Client (Google, GitHub)
- JWT (JJWT)
- Spring Data MongoDB
- Maven Wrapper

## Core Features

- Authentication:
  - Email/password login and registration
  - OAuth2 login with Google and GitHub
  - Role-aware routing and protected pages
- Resource Management:
  - Browse and manage campus resources
  - Availability checks
  - QR-based check-in workflow
- Booking Management:
  - Create and manage bookings
  - Admin-side booking approvals
  - Booking status and notifications
- Ticketing System:
  - Create/update tickets
  - Assignment and unassigned queues for technicians
  - Timeline, comments, and dispute flow
  - SLA countdown/tracking
- Admin Operations:
  - Dashboard for resources/bookings/tickets
  - Security audit and login activity views
  - Notification controls/preferences

## User Roles

- USER: standard student/user workflows (resources, bookings, tickets, profile)
- TECHNICIAN: assigned/unassigned ticket handling
- ADMIN: management dashboards and approvals

## Prerequisites

Install the following:
- Node.js 20+
- npm 10+
- Java 17
- MongoDB (local or Atlas)

## Quick Start

### 1) Clone and open

```bash
git clone <your-repo-url>
cd it3030-paf-2026-smart-campus
```

### 2) Run backend

From the backend directory:

```bash
cd backend
./mvnw spring-boot:run
```

Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend default:
- URL: http://localhost:8081
- Active profile: local

### 3) Run frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend default:
- URL: http://localhost:5173

## Configuration

Backend settings are in:
- `backend/src/main/resources/application.properties`
- `backend/src/main/resources/application-local.properties`

Important properties include:
- `spring.data.mongodb.uri`
- `spring.security.oauth2.client.registration.google.*`
- `spring.security.oauth2.client.registration.github.*`
- `app.jwt.secret`
- `app.frontend-url`
- `app.admin-emails`

### Security Note

Do not commit real credentials or secrets in properties files. Prefer environment variables for:
- OAuth client IDs/secrets
- JWT secret
- Database connection strings

## Build and Test

### Backend

```bash
cd backend
./mvnw test
./mvnw package
```

Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd package
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
npm run preview
```

## API Surface (High Level)

Backend controllers indicate endpoints under areas such as:
- `/api/auth`
- `/api/user` and `/api/users`
- `/api/resources`
- `/api/bookings`
- `/api/tickets` (including comments/timeline/notifications)
- `/api/notifications` and preferences
- `/api/login-audit`
- QR check-in routes

## Frontend Routing (High Level)

- Public:
  - `/`, `/home`, `/login`, `/register`, `/oauth-callback`
- User:
  - `/dashboard`, `/resources`, `/my-bookings`, `/my-tickets`, `/tickets/:id`, `/profile`
- Admin:
  - `/admin/dashboard`, `/admin/resources`, `/admin/bookings`, `/admin/tickets`, `/admin/tickets/:id`, `/admin/security`, `/admin/notifications`, `/admin/profile`
- Technician:
  - `/technician/dashboard`, `/technician/assigned`, `/technician/unassigned`, `/technician/tickets/:id`, `/technician/profile`

## Development Notes

- Frontend API base URL is currently set in source (`frontend/src/context/AuthContext.jsx`) as `http://localhost:8081`.
- The frontend includes local/mock fallback behavior for some data and auth paths to keep UI flows usable during backend issues.

## License

This project is distributed under the terms described in the `LICENSE` file.
