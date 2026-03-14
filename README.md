# Django + React Todo (Task Manager)

A full-stack task manager with boards, real-time updates over WebSockets, and JWT authentication.

**Live demo:** [https://django-react-todo.vercel.app/](https://django-react-todo.vercel.app/)

---

## Project structure

```
django-react-todo/
├── backend/          # Django API + WebSockets
├── frontend/         # React SPA (Vite + TypeScript)
└── README.md
```

---

## Backend (Django)

### Technologies & modules

| Category                 | Technology                                                       |
| ------------------------ | ---------------------------------------------------------------- |
| **Framework**            | Django 5+                                                        |
| **API**                  | Django REST Framework                                            |
| **Auth**                 | djangorestframework-simplejwt (JWT access tokens)                |
| **CORS**                 | django-cors-headers                                              |
| **Config**               | python-decouple (environment variables)                          |
| **WebSockets**           | Django Channels, Daphne (ASGI)                                   |
| **Database**             | PostgreSQL (psycopg2-binary); SQLite for local dev if DB not set |
| **Linting / formatting** | flake8, black, isort, flake8-isort                               |
| **Type checking**        | django-stubs, djangorestframework-stubs                          |
| **Linting (Django)**     | pylint-django                                                    |

### Apps

- **`core`** – Settings, root URLs, ASGI (HTTP + WebSocket), JWT auth middleware for WebSockets.
- **`users`** – Custom User model (UUID, email as `USERNAME_FIELD`), login, register, me (profile) APIs.
- **`todos`** – Boards, board memberships/invitations, tasks; REST APIs + WebSocket consumer for live task updates.

### Backend structure (high level)

```
backend/
├── core/                 # Project config
│   ├── asgi.py           # ProtocolTypeRouter (http + websocket)
│   ├── middleware.py     # JWT auth for WebSocket connections
│   ├── routing.py       # WebSocket URL routing
│   ├── settings.py
│   └── urls.py
├── users/                # Auth & user API
├── todos/
│   ├── consumers/       # WebSocket consumers (e.g. board tasks)
│   ├── migrations/
│   ├── models.py        # Board, BoardMembership, Task
│   ├── permissions/     # Board & invitation permissions
│   ├── routing.py       # WebSocket routes (e.g. ws/boards/<id>/)
│   ├── serializers/     # Board, invitation, task serializers
│   ├── services/        # Business logic (board, invitation, task)
│   ├── urls.py
│   └── views/           # Board, invitation, stats views
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── manage.py
└── .env.example
```

### Main API surface

- **Auth** (`/api/auth/`): login, register, me (GET/PATCH).
- **Boards** (`/api/boards/`): list, create, retrieve, update, delete; paginated list.
- **Board tasks** (`/api/boards/<id>/tasks/`): list tasks for a board.
- **Task summary** (`/api/boards/task-summary/`): current user’s completed/pending task counts (assigned tasks).
- **Invitations**: list “my” invitations (`/api/boards/invitations/`); per-board list/create/respond under `/api/boards/<id>/invitations/`.
- **WebSocket** (`ws/boards/<board_id>/`): live task create/update/delete; auth via `?token=<access_token>`.

### Setup (backend)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements/base.txt -r requirements/development.txt
cp .env.example .env
# Edit .env (SECRET_KEY, DB if using PostgreSQL, CORS_ALLOWED_ORIGINS, etc.)
python manage.py migrate
python manage.py runserver
# Or with WebSockets: daphne -b 0.0.0.0 -p 8000 core.asgi:application
```

---

## Frontend (React)

### Technologies & modules

| Category        | Technology                                                                       |
| --------------- | -------------------------------------------------------------------------------- |
| **Build**       | Vite 7                                                                           |
| **UI**          | React 19, TypeScript                                                             |
| **Styling**     | Tailwind CSS 4, shadcn (Base UI components), Geist variable font                 |
| **Routing**     | react-router-dom                                                                 |
| **State**       | Redux Toolkit (auth token), React Query (@tanstack/react-query) for server state |
| **Forms**       | react-hook-form, Zod, @hookform/resolvers (zod)                                  |
| **HTTP**        | Axios (auth interceptors, base URL)                                              |
| **WebSockets**  | reconnecting-websocket                                                           |
| **Drag & drop** | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities                             |
| **Icons**       | lucide-react                                                                     |
| **Utilities**   | clsx, tailwind-merge, class-variance-authority                                   |

### Frontend structure (high level)

```
frontend/src/
├── components/       # Shared UI (layout, common, ui from shadcn)
├── hooks/            # useAuth, useTask, useInvitation, useBoardTasksSocket
├── lib/              # query (client, keys), ws (boardTasksSocket), utils
├── pages/            # auth, dashboard, profile, board, invitations
├── routes/           # App routes, protected/guest routes
├── schemas/          # Zod schemas (auth, profile, board, invitation, task)
├── services/         # api, authService, boardService, invitationService
├── store/            # Redux (authSlice)
├── types/            # user, board, task
├── App.tsx
└── main.tsx
```

### Main features

- **Auth**: Login, register, profile (me); JWT in `localStorage`, user from React Query; redirects for protected/guest routes.
- **Dashboard**: Task summary stats (total, completed, pending) via `useTask` and `/api/boards/task-summary/`.
- **Boards**: List boards, create board (modal), open board detail; members and invitations (invite, accept/decline).
- **Board detail**: Kanban (To Do / In Progress / Done) with drag-and-drop; create/update/delete tasks via WebSocket; assignee and due date on cards.

### Setup (frontend)

```bash
cd frontend
npm install
cp .env.example .env
# Optional: set VITE_API_URL if API is not at http://localhost:8000/api
npm run dev
```

Production build: `npm run build`. Preview: `npm run preview`.

---

## Environment

### Backend (`.env`)

See `backend/.env.example`. Main options:

- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS` (e.g. `http://localhost:5173`)
- Optional: DB (PostgreSQL), Redis (for Channels when `DEBUG=False`)

### Frontend (`.env`)

See `frontend/.env.example`:

- `VITE_API_URL` – API base URL (default `http://localhost:8000/api`)

---

## Running the app

1. Start backend: from `backend/`, activate venv, then `python manage.py runserver` (or use Daphne for WebSockets in production).
2. Start frontend: from `frontend/`, `npm run dev`.
3. Open the app at the URL shown by Vite (e.g. `http://localhost:5173`). Ensure `CORS_ALLOWED_ORIGINS` includes that origin.

---

## Development

- **Backend**: Format with black/isort; lint with flake8. Type checking uses django-stubs/djangorestframework-stubs (e.g. with Pyright/Pylance).
- **Frontend**: Lint with ESLint (`npm run lint`); TypeScript strict mode.
