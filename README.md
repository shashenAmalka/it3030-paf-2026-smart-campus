# 🏛️ Smart Campus Hub

**Smart Campus Hub** is a premium, full-stack campus management ecosystem designed to streamline operations between students, administrators, and technicians. The platform focuses on high performance, secure authentication, and real-time engagement.

---

## 🚀 Key Modules (Focus: Member 4)

### 🔐 Module E: Authentication & Authorization
A secure, multi-tier security system providing seamless access control.
*   **OAuth 2.0 Integration:** Secure login via Google and GitHub.
*   **Role-Based Access Control (RBAC):** Distinct permissions for `USER`, `ADMIN`, and `TECHNICIAN`.
*   **JWT Security:** Stateless authentication using JSON Web Tokens.
*   **Manual Auth:** Robust registration with BCrypt password hashing.

### 🔔 Module D: Smart Notifications
A real-time communication engine that keeps the campus synchronized.
*   **Global Alerts:** Notifications for booking requests, ticket updates, and comments.
*   **Admin Dashboard:** A dedicated full-page notification panel for administrative oversight.
*   **Smart Routing:** Instant navigation from notifications to the relevant booking or ticket.

---

## ✨ Innovation Features (Member 4)

### 🛡️ 1. Security Audit & Login Activity
To enhance user security, the system maintains a detailed audit trail of every login attempt.
*   **Tracking:** Records login time, IP address, and authentication method.
*   **User Transparency:** Users can view their recent login history in their profile.
*   **Admin Oversight:** Administrators can monitor system-wide security logs to detect anomalies.

### ⚙️ 2. Personalization: Notification Preferences
Provides users with full control over their digital campus experience.
*   **Granular Toggles:** Users can enable/disable specific alert categories (Bookings, Tickets, System Alerts).
*   **Preference Persistence:** Settings are saved per-user in the backend database.
*   **Filter Logic:** The notification engine dynamically respects user preferences before delivery.

---

## 💻 Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Spring Boot 3.x, Java 17, Spring Security |
| **Frontend** | React.js, Vite, Tailwind CSS, Lucide Icons |
| **Database** | MySQL / MongoDB (via Spring Data JPA) |
| **Auth** | OAuth 2.0, JWT, BCrypt |
| **Design** | Glassmorphism, Modern Minimalist (Apple-inspired) |

---

## 🛠️ Setup & Installation

### Backend
1. Navigate to the `/backend` folder.
2. Ensure you have **JDK 17** installed.
3. Update `application.properties` with your database credentials.
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend
1. Navigate to the `/frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 👥 Contributors
*   **Member 4:** Notifications, Authentication, Security Audit, and Notification Preferences.
*   *(Member 1: Facilities)*
*   *(Member 2: Bookings)*
*   *(Member 3: Ticketing)*

---

## 📄 License
This project is developed for the **PAF Module 2026**. All rights reserved.
