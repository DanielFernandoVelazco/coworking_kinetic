<div align="center">

# 🏢 Kinetic Workspace

### Premium workspace booking platform for modern professionals

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-12-239120?logo=csharp&logoColor=white)](https://learn.microsoft.com/en-us/dotnet/csharp/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Docs](#-documentation)

</div>

---

## 📖 Overview

**Kinetic Workspace** is a full-stack platform for booking premium workspaces — private offices, meeting rooms, focus pods, and creative spaces — across 10 Swedish cities.

Built as a production-grade reference implementation demonstrating:
- Clean architecture with **Services / Repositories / Facades**
- **JWT authentication** with refresh token rotation
- **Atomic payment processing** with invoice generation
- **Rate limiting**, **CORS hardening**, and **global exception handling**
- A polished **React 19 + Vite + Tailwind** frontend with dark mode

---

## ✨ Features

### For Users
- 🔍 **Browse & search** 75+ premium spaces by city, type, capacity
- 📅 **Real-time availability** checking across time ranges
- 🛒 **Cart-based booking flow** with 30-minute pre-reservation hold
- 💳 **Checkout simulation** (credit card, PayPal, bank transfer)
- 🧾 **Automatic invoice generation** with per-year atomic counters
- 📊 **Profile dashboard** with booking history and analytics
- 🔔 **In-app notifications** (alerts system with polling)
- 🌙 **Dark mode** with system preference detection

### For Administrators
- 📈 **Analytics dashboard** with charts (Recharts)
- 🏢 **Full CRUD** for spaces, amenities, and users
- 📋 **Reservation management** with filters, sorting, and pagination
- 🎯 **Bulk alert broadcasting** with recipient targeting
- 📤 **Excel report export** (EPPlus)
- 🔐 **Role-based access control**

### Security & Reliability
- 🔑 JWT with rotation + revocation on password change
- 🛡️ Rate limiting on auth endpoints (`AspNetCoreRateLimit`)
- 🌐 Strict CORS whitelist with origin validation
- 🧾 Global exception middleware with domain exceptions
- 🔒 BCrypt password hashing + SHA-256 token hashing
- 💉 Parameterized SQL everywhere (no injection surface)

---

## 🖼️ Screenshots

> ⚠️ **Replace with real screenshots** — place them in `docs/screenshots/`

| Landing | Catalog | Booking |
|---------|---------|---------|
| ![Landing](docs/screenshots/landing.png) | ![Catalog](docs/screenshots/catalog.png) | ![Booking](docs/screenshots/booking.png) |

| Admin Dashboard | Admin Reservations | Dark Mode |
|-----------------|-------------------|-----------|
| ![Dashboard](docs/screenshots/admin-dashboard.png) | ![Reservations](docs/screenshots/admin-reservations.png) | ![Dark](docs/screenshots/dark-mode.png) |

---

## 🛠️ Tech Stack

### Backend
| Category | Technology |
|----------|-----------|
| Runtime | .NET 8 / C# 12 |
| Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core 8 |
| Database | MySQL 8 (Pomelo provider) |
| Auth | JWT Bearer + Refresh Tokens |
| Validation | Data Annotations |
| Mapping | AutoMapper 13 |
| Logging | Serilog (Console + File rolling) |
| Rate Limiting | AspNetCoreRateLimit |
| Reports | EPPlus |
| Health Checks | EF Core Diagnostics |
| API Docs | Swashbuckle (Swagger) |

### Frontend
| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Build | Vite 8 |
| Routing | React Router 7 |
| State | Context API (Auth, Cart, Alerts, Theme) |
| HTTP | Axios with interceptors |
| Styling | Tailwind CSS 3 |
| Forms | React Hook Form + Yup |
| Charts | Recharts 3 |
| UI | Headless UI + Heroicons |
| Icons | Material Symbols |
| Notifications | React Hot Toast |

---

## 🏗️ Architecture

### High-Level Flow

```
┌──────────────────────────────────────────────────────────────┐
│                       React Frontend                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Pages   │  │ Contexts │  │  Hooks   │  │ Services │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └─────────────┴─────────────┴─────────────┘           │
│                           │                                  │
│                    Axios Interceptors                        │
│              (auto-refresh, public endpoints,                │
│               error normalization)                           │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS / REST
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    ASP.NET Core Web API                      │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│  │ Controllers │──▶│   Services   │──▶│   Repositories   │  │
│  └─────────────┘   │  (Facades +  │   │  (Generic +      │  │
│                    │ specialized) │   │   specialized)   │  │
│                    └──────┬───────┘   └────────┬─────────┘  │
│                           │                    │             │
│                    ┌──────▼───────────────┐    │             │
│                    │  EF Core + DbContext │◀───┘             │
│                    └──────────┬───────────┘                  │
└───────────────────────────────┼──────────────────────────────┘
                                │
                       ┌────────▼────────┐
                       │   MySQL 8.0     │
                       └─────────────────┘
```

### Backend Layering

- **Controllers** — thin, delegate to services, no business logic
- **Services** — business rules; facades (`ReservationService`, `UserService`, `AdminService`) compose specialized services
- **Repositories** — data access; `GenericRepository<T>` + specialized interfaces
- **Helpers** — cross-cutting utilities (`JwtHelper`, `PasswordHelper`, `TokenHasher`, `PricingCalculator`, `ReservationDateValidator`, `TimeAgoFormatter`)
- **Middleware** — global exception handling, request logging
- **Extensions** — DI, config, CORS, JWT, Swagger, rate limiting, health checks

### Frontend Layering

- **Pages** — route-level components, thin orchestration
- **Contexts** — global state (`AuthContext`, `CartContext`, `AlertContext`, `ThemeContext`)
- **Hooks** — reusable logic (`useAlertPolling`, `useDebounce`, `usePagination`, `useFilters`)
- **Components** — UI primitives + feature components
- **API layer** — services + axios config + interceptors
- **Utils** — formatters, storage helpers, calculators

---

## 🚀 Quick Start

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [MySQL 8](https://dev.mysql.com/downloads/mysql/)

### 1. Clone

```bash
git clone https://github.com/⚠️TU_USUARIO/kinetic-workspace.git
cd kinetic-workspace
```

### 2. Backend

```bash
cd backend/KineticWorkspace.API

# Create .env in this directory
cat > .env <<EOF
ConnectionStrings__DefaultConnection=Server=localhost;Port=3306;Database=kinetic_workspace;User=root;Password=YOUR_PASSWORD;
JwtSettings__SecretKey=YOUR_64_CHAR_RANDOM_SECRET_KEY_HERE_MINIMUM_32_CHARS
CorsSettings__AllowedOrigins__0=http://localhost:5173
AppSettings__FrontendUrl=http://localhost:5173
EOF

dotnet restore
dotnet ef database update
dotnet run
```

Backend runs at **http://localhost:5134** — Swagger at `/swagger`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**.

---

## 🔐 Test Credentials

Seeded automatically on first run in Development:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@kineticworkspace.com` | `Admin123!` |
| **User** | `test@kineticworkspace.com` | `Test123!` |

> ⚠️ These credentials are for **local development only**. Change them before any deployment.

---

## 📁 Project Structure

```
kinetic-workspace/
├── backend/
│   └── KineticWorkspace.API/
│       ├── Controllers/          # HTTP endpoints
│       ├── Services/             # Business logic (interfaces + impls)
│       ├── Repositories/         # Data access (generic + specialized)
│       ├── Models/
│       │   ├── Entities/         # EF Core entities
│       │   └── DTOs/             # Request/response contracts
│       ├── Data/
│       │   ├── Configurations/   # EF Fluent config
│       │   ├── SeedData/         # Seeders + catalogs
│       │   └── ApplicationDbContext.cs
│       ├── Helpers/              # Cross-cutting utilities
│       ├── Extensions/           # DI, config, middleware registration
│       ├── Middleware/           # Exception handling
│       ├── Exceptions/           # Domain exception hierarchy
│       ├── Mappings/             # AutoMapper profiles
│       ├── Migrations/           # EF Core migrations
│       └── Program.cs
│
├── frontend/
│   └── src/
│       ├── api/                  # Services + axios config
│       ├── components/           # UI + feature components
│       ├── context/              # React contexts
│       ├── hooks/                # Custom hooks
│       ├── pages/                # Route components
│       ├── utils/                # Formatters, helpers
│       ├── App.jsx
│       ├── AppRoutes.jsx
│       └── main.jsx
│
├── docs/                         # Screenshots, diagrams
├── README.md                     # ← you are here
├── backend/README.md
└── frontend/README.md
```

---

## 📚 Documentation

- 🔧 [**Backend README**](./backend/README.md) — .NET setup, architecture, endpoints, patterns
- 🎨 [**Frontend README**](./frontend/README.md) — React setup, state, theming, conventions

---

## 🧪 Testing

> ⚠️ Tests are on the roadmap. Currently the project relies on integration testing via Swagger and manual QA.

Planned:
- xUnit + FluentAssertions for backend unit tests
- Vitest + React Testing Library for frontend
- Playwright for E2E critical flows

---

## 🚢 Deployment

### Backend
- Dockerfile not yet included
- Recommended: **Azure App Service** or **Railway** with managed MySQL
- Set `ASPNETCORE_ENVIRONMENT=Production`
- Apply migrations in CI/CD (`dotnet ef database update`) — **not** at startup

### Frontend
- Build: `npm run build` → `dist/`
- Recommended: **Vercel**, **Netlify**, or **Cloudflare Pages**
- Set `VITE_API_URL` to production backend URL

### Environment Variables (Production)
```bash
ConnectionStrings__DefaultConnection=...
JwtSettings__SecretKey=...
JwtSettings__Issuer=...
JwtSettings__Audience=...
CorsSettings__AllowedOrigins__0=https://your-domain.com
AppSettings__FrontendUrl=https://your-domain.com
```

---

## 🗺️ Roadmap

- [ ] Email delivery (password reset, booking confirmations)
- [ ] Real payment gateway integration (Stripe)
- [ ] Automated test suite
- [ ] Docker Compose for local dev
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Real-time alerts via SignalR
- [ ] Multi-language support (i18n)

---

## 🤝 Contributing

This is a personal portfolio project. Contributions are welcome via issues and pull requests, but the roadmap is curated by the author.

### Conventions
- Backend: PascalCase for public members, `Async` suffix for async methods, no `try/catch` in controllers (use middleware)
- Frontend: functional components + hooks only, camelCase for functions/variables, one component per file
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`)

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 👤 Author

**⚠️ TU_NOMBRE**

- GitHub: [@⚠️TU_USUARIO](https://github.com/⚠️TU_USUARIO)
- LinkedIn: [⚠️TU_LINKEDIN](https://linkedin.com/in/⚠️TU_LINKEDIN)
- Email: ⚠️TU_EMAIL

---

<div align="center">

**⭐ If this project helped you, consider giving it a star!**

</div>