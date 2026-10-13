# PrimeReserve — Resource Reservation Management System

PrimeReserve is a full-stack web application designed to help organizations manage shared resources and coordinate reservations through a centralized platform.

The system allows administrators to manage resources while staff members can view available resources and create reservations. Reservations are automatically confirmed when the selected resource is available for the requested time slot, helping prevent scheduling conflicts.

## Features

### Authentication and Authorization
- Secure login with password hashing.
- Role-based access control for Admin and Staff users.
- Separate permissions for administrators and staff members.

### Resource Management
- View available resources and their details.
- Create, edit, and delete resources as an administrator.
- Track resource availability status.

### Reservation Management
- Create reservations for available resources.
- Automatically confirm valid reservations.
- Prevent overlapping reservations for the same resource.
- View reservations according to user permissions.
- Cancel reservations while preserving reservation records.

### Dashboard
- View resource and reservation summaries.
- Access dedicated Resources and Reservations pages.
- Review upcoming reservations and resource information.

## Technology Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT-based sessions and HTTP cookies
- **Password Hashing:** bcryptjs

## Prerequisites

Install the following before running the application:

- Node.js and npm
- PostgreSQL
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd resource-reservation-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and configure the following variables using your local PostgreSQL credentials and a secure session secret:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/prime_reserve_db"
SESSION_SECRET="YOUR_SECURE_SESSION_SECRET"
ADMIN_NAME="Administrator"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="YOUR_SECURE_ADMIN_PASSWORD"
```

Replace the example values with your own local configuration. URL-encode special characters in the database password when required.

**Security:** Never commit `.env` or publish database credentials, session secrets, or real passwords.

### 4. Set up the database

Run the Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma Client:

```bash
npx prisma generate
```

### 5. Create the initial administrator

Configure ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your local .env file.

Run the seed script to create or update the initial administrator account:

npm run db:seed

Use a strong administrator password that meets the requirements enforced by the seed script.

### 6. Start the development server

```bash
npm run dev
```

Open the local URL printed in the terminal, usually:

http://localhost:3000

## User Roles

| Capability | Admin | Staff |
|---|---|---|
| View resources | Yes | Yes |
| Create resources | Yes | No |
| Edit resources | Yes | No |
| Delete resources | Yes | No |
| Create reservations | Yes | Yes |
| View reservations | All reservations | Own reservations |
| Cancel reservations | Any reservation | Own reservations |

## Reservation Rules

- A reservation is automatically confirmed when the resource is available for the requested time.
- Overlapping reservations for the same resource are rejected.
- Reservations for different resources can take place during the same time period.
- Cancelled reservations no longer occupy their original time slot.

## Project Structure

```text
resource-reservation-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── resources/
│   │   └── reservations/
│   ├── components/
│   ├── login/
│   ├── resources/
│   ├── reservations/
│   └── page.tsx
├── lib/
│   ├── auth.ts
│   └── prisma.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Future Improvements

- **Recurring Reservations:** Support daily and weekly bookings for recurring meetings and activities.
- **Email and In-App Notifications:** Send reservation confirmations, reminders, and cancellation notifications.
- **Calendar Integration:** Allow users to synchronize reservations with Google Calendar and Microsoft Outlook.
- **Waitlist Management:** Notify users when a previously booked time slot becomes available after cancellation.
- **Deployment:** Deploy the application to a hosted platform with a managed PostgreSQL database.
- **Accessibility and Responsive Design:** Improve keyboard navigation, accessibility support, and usability across desktop, tablet, and mobile devices.

## Author

Developed as a full-stack software engineering internship technical assessment.
