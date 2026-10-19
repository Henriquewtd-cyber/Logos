# Logos

**Logistics Incident Management Platform**

Logos is a web application designed to centralize logistics incident management, helping users monitor occurrences, filter records, and identify incidents that require attention.

## Features

- **Authentication:** User login with JWT-based authentication.
- **Incident Management:** View and manage logistics incident records.
- **Advanced Filtering:** Filter incidents by category, severity, and status.
- **Request State Handling:** Handle loading states, errors, and empty results.
- **REST API:** Communicate with the backend through HTTP requests.
- **Cloud Deployment:** Frontend and backend deployed separately.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Database Hosting | Neon |
| Authentication | JWT |
| Backend Hosting | Render |
| Frontend Hosting | Render Static Site |

## Architecture

The application follows a frontend-backend architecture.

- **Frontend:** Responsible for the user interface, user interactions, filtering controls, and API communication.
- **Backend:** Provides REST endpoints, validates requests, handles authentication, and accesses the database.
- **Database:** PostgreSQL stores application data and is hosted on Neon.

The frontend communicates with the backend through HTTP requests. Protected endpoints require valid authentication, while sensitive configuration values are maintained outside the public source code.

## Incident Categories

The platform supports the following incident categories:

- Vehicle Accident
- Accident with Injuries
- Unusual Road Weather Conditions
- Mechanical Failure
- Road Blockage

Incidents can also be classified by severity:

- High
- Medium
- Low

Filtering by category, severity, and status helps users narrow down the records relevant to their analysis.

## Project Structure

```text
Logos/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── ...
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

The structure above is illustrative. Directory names may vary depending on the current implementation.

## Getting Started

### Prerequisites

- Python 3.11 or a compatible version supported by the project dependencies
- Node.js and npm
- PostgreSQL database
- Git

### 1. Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd Logos
```

### 2. Set Up the Backend

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

Configure the environment variables required by the application in a `.env` file. These may include the database connection string and JWT secret, depending on the current configuration.

### 3. Configure the Database

Set the PostgreSQL connection string to point to your database.

Apply the database migrations using Alembic:

```bash
alembic upgrade head
```

Run this command from the directory containing the appropriate Alembic configuration.

### 4. Start the Backend

From the backend directory, run:

```bash
uvicorn app.main:app --reload
```

The API will normally be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### 5. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory with the backend API URL:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Vite will display the local URL in the terminal.

## Environment Configuration

Keep secrets out of version control. Use environment variables for sensitive settings and deployment-specific configuration.

Typical configuration values include:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Secret used to sign JWTs |
| `ALGORITHM` | JWT signing algorithm |
| `VITE_API_URL` | Backend API URL used by the frontend |

Variable names must match those actually read by the application. The frontend's `VITE_` variables are embedded into the client build, so they must never contain secrets.

## Deployment

The application is deployed using separate services:

- **Frontend:** Render Static Site, built with Vite.
- **Backend:** Render Web Service running FastAPI and Uvicorn.
- **Database:** Neon PostgreSQL.

The frontend uses `VITE_API_URL` to communicate with the deployed API. The backend must be configured with the production database connection, appropriate CORS origins, and the required authentication secrets.

Database migrations should be applied before using endpoints that depend on the migrated tables.

## Security

The application uses JWT-based authentication to protect restricted API endpoints.

Security considerations include:

- Validate authentication tokens on protected endpoints.
- Keep database credentials and signing secrets out of the frontend and source control.
- Configure CORS to allow only the intended frontend origins.
- Use HTTPS for production communication.
- Validate request parameters and input data on the backend.

## License

No license has been specified yet. Add a license file if you intend to distribute the project under an open-source license.