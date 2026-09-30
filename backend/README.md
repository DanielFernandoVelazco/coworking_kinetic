# 🔧 Kinetic Workspace — Backend

ASP.NET Core 8 Web API for the Kinetic Workspace booking platform.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![EF Core](https://img.shields.io/badge/EF%20Core-8-512BD4)](https://learn.microsoft.com/en-us/ef/core/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

---

## 📋 Table of Contents

- [Requirements](#-requirements)
- [Setup](#-setup)
- [Configuration](#-configuration)
- [Running](#-running)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Database](#-database)
- [Authentication](#-authentication)
- [API Endpoints](#-api-endpoints)
- [Conventions](#-conventions)
- [Testing](#-testing)

---

## 🧰 Requirements

| Tool | Version |
|------|---------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0+ |
| [MySQL](https://dev.mysql.com/downloads/) | 8.0+ |
| [EF Core CLI](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) | `dotnet tool install --global dotnet-ef` |

---

## 🚀 Setup

### 1. Restore dependencies

```bash
cd backend/KineticWorkspace.API
dotnet restore
```

### 2. Create `.env` file

Create a `.env` file **in the same directory as `KineticWorkspace.API.csproj`**:

```env
# Database
ConnectionStrings__DefaultConnection=Server=localhost;Port=3306;Database=kinetic_workspace;User=root;Password=YOUR_PASSWORD;

# JWT (SecretKey MUST be at least 32 characters; use 64+ for production)
JwtSettings__SecretKey=CHANGE_ME_64_CHAR_RANDOM_STRING_HERE_ABCDEF1234567890
JwtSettings__Issuer=KineticWorkspace
JwtSettings__Audience=KineticWorkspaceAPI
JwtSettings__ExpirationMinutes=60

# CORS (indexed keys for arrays)
CorsSettings__AllowedOrigins__0=http://localhost:5173

# Frontend URL (used for password reset links)
AppSettings__FrontendUrl=http://localhost:5173
```

> 🔐 **Never commit `.env`** — it's already in `.gitignore`.

### 3. Apply migrations

```bash
dotnet ef database update
```

### 4. Run

```bash
dotnet run
```

- **API**: http://localhost:5134
- **Swagger**: http://localhost:5134/swagger
- **Health**: http://localhost:5134/health

---

## ⚙️ Configuration

### Configuration Precedence

`Program.cs` loads configuration in this order (later sources override earlier):

1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. **User Secrets** (Development only)
4. **Environment variables** (from `.env` via `DotNetEnv`)
5. **Command-line arguments**

### Required Configuration

`ValidateRequiredConfiguration()` fails fast at startup if any of these are missing:

| Key | Constraint |
|-----|-----------|
| `JwtSettings:SecretKey` | ≥ 32 characters |
| `ConnectionStrings:DefaultConnection` | non-empty |
| `CorsSettings:AllowedOrigins` | ≥ 1 origin |

### Environment Files

| File | Purpose |
|------|---------|
| `.env` | Local secrets (gitignored) |
| `appsettings.json` | Committed defaults |
| `appsettings.Development.json` | Dev overrides (verbose logging) |

---

## 🏃 Running

### Development

```bash
dotnet run
```

Automatically:
- Applies pending migrations
- Seeds 75 spaces, amenities, admin + test users
- Enables Swagger UI
- Enables detailed EF logging
- Enables sensitive data logging (⚠️ dev only)

### Production

```bash
dotnet publish -c Release -o ./publish
cd publish
ASPNETCORE_ENVIRONMENT=Production dotnet KineticWorkspace.API.dll
```

In Production:
- Migrations are **skipped** at startup (apply via CI/CD)
- HTTPS redirection is enabled
- Swagger is disabled
- CORS rejects `localhost` origins

---

## 📁 Project Structure

```
KineticWorkspace.API/
├── Controllers/                   # API endpoints
│   ├── AuthController.cs
│   ├── UsersController.cs
│   ├── SpacesController.cs
│   ├── ReservationsController.cs
│   ├── PreReservationsController.cs
│   ├── AlertsController.cs
│   ├── AmenitiesController.cs
│   └── AdminController.cs
│
├── Services/
│   ├── Interfaces/                # Service contracts
│   └── Implementations/           # Service logic
│       ├── Admin/                 # Admin dashboard, reports, alerts
│       ├── Payments/              # Payment processing + invoicing
│       ├── Reservations/          # User + admin reservation services
│       ├── Spaces/                # Availability + amenities
│       └── Users/                 # Profile + admin user services
│
├── Repositories/
│   ├── Interfaces/
│   └── Implementations/
│       ├── GenericRepository.cs   # Reusable CRUD base
│       └── *Repository.cs         # Specialized repos
│
├── Models/
│   ├── Entities/                  # EF Core entities
│   └── DTOs/                      # Request/response contracts
│       ├── Admin/
│       ├── Alerts/
│       ├── Amenities/
│       ├── Auth/
│       ├── PreReservations/
│       ├── Reservations/
│       ├── Spaces/
│       └── Users/
│
├── Data/
│   ├── ApplicationDbContext.cs
│   ├── Configurations/            # IEntityTypeConfiguration<T>
│   ├── SeedData/
│   │   ├── SeedCatalogs/          # Static seed data
│   │   └── Seeders/               # ISeeder implementations
│   └── DataSeeder.cs              # Orchestrator
│
├── Helpers/
│   ├── JwtHelper.cs
│   ├── PasswordHelper.cs
│   ├── TokenHasher.cs
│   ├── Formatting/TimeAgoFormatter.cs
│   ├── Pricing/PricingCalculator.cs
│   └── Validation/ReservationDateValidator.cs
│
├── Extensions/                    # DI + middleware registration
│   ├── CorsExtensions.cs
│   ├── DatabaseExtensions.cs
│   ├── DatabaseInitializationExtensions.cs
│   ├── DependencyInjectionExtensions.cs
│   ├── ExceptionMiddlewareExtensions.cs
│   ├── HealthCheckExtensions.cs
│   ├── JwtExtensions.cs
│   ├── RateLimitingExtensions.cs
│   ├── SerilogExtensions.cs
│   ├── SwaggerExtensions.cs
│   └── ClaimsPrincipalExtensions.cs
│
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs
│
├── Exceptions/
│   ├── AppException.cs            # Abstract base with StatusCode
│   ├── BusinessException.cs       # 400
│   ├── ForbiddenException.cs      # 403
│   ├── NotFoundException.cs       # 404
│   └── UnauthorizedException.cs   # 401
│
├── Mappings/
│   ├── MappingProfile.cs          # AutoMapper profile
│   └── Resolvers/                 # Custom value resolvers
│
├── Migrations/                    # EF Core migrations
├── Program.cs
└── KineticWorkspace.API.csproj
```

---

## 🏛️ Architecture

### Layering

```
HTTP Request
    ↓
[Middleware]  ExceptionHandlingMiddleware
    ↓
[Controller]  Thin — delegates to services
    ↓
[Service]     Business logic
              Facades compose specialized services
    ↓
[Repository]  Data access via EF Core
    ↓
[DbContext]   ApplicationDbContext
    ↓
[MySQL]       Persistence
```

### Service Facades

Some controllers inject **facade interfaces** that delegate to specialized services. This keeps controllers stable while allowing service decomposition:

| Facade | Delegates to |
|--------|--------------|
| `IReservationService` | `IUserReservationService`, `IAdminReservationService` |
| `IUserService` | `IUserProfileService`, `IUserAdminService` |
| `IAdminService` | `IAdminDashboardService`, `IAdminReportService`, `IAdminAlertService` |
| `ISpaceService` | `ISpaceAvailabilityService`, `ISpaceAmenityService` |

### Exception Handling

Domain exceptions inherit from `AppException`:

```csharp
public abstract class AppException : Exception
{
    public abstract int StatusCode { get; }
}
```

`ExceptionHandlingMiddleware` translates them to HTTP status codes:

| Exception | Status |
|-----------|--------|
| `BusinessException` | 400 |
| `UnauthorizedException` / `UnauthorizedAccessException` | 401 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `InvalidOperationException` | 400 (backward compat) |
| Any other | 500 |

### Transaction Handling

Complex operations (e.g., payment confirmation) use EF's execution strategy + explicit transactions:

```csharp
var strategy = _context.Database.CreateExecutionStrategy();
return await strategy.ExecuteAsync(async () =>
{
    await using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // ... atomic operations
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
});
```

---

## 🗄️ Database

### Entities

| Entity | Purpose |
|--------|---------|
| `User` | Accounts (users + admins) |
| `Space` | Bookable workspaces |
| `Reservation` | Confirmed bookings |
| `PreReservation` | 30-minute cart hold |
| `Payment` | Payment records |
| `Invoice` | Generated invoices with per-year counter |
| `Amenity` | Space features (WiFi, projector, etc.) |
| `Review` | Space ratings (1–5) |
| `Alert` | In-app notifications |
| `RefreshToken` | JWT refresh tokens (hashed) |
| `PasswordResetToken` | Password reset tokens (hashed) |
| `AuditLog` | Audit trail (optional) |
| `InvoiceCounter` | Atomic per-year invoice numbering |

### Migrations

```bash
# Add a new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Roll back to a specific migration
dotnet ef database update PreviousMigrationName

# List migrations
dotnet ef migrations list

# Remove last migration (if not applied)
dotnet ef migrations remove
```

### Seeding

Seeding runs **only in Development** and is idempotent:

| Seeder | Creates |
|--------|---------|
| `AmenitySeeder` | ~25 unique amenities |
| `SpaceSeeder` | 75 spaces (15 per type × 5 types) |
| `AdminUserSeeder` | 1 admin |
| `SeederDataUser` | 1 test user + 15 reservations + payments |

To reset the database:
```bash
dotnet ef database drop
dotnet ef database update
dotnet run
```

---

## 🔐 Authentication

### Flow

```
1. POST /api/auth/login
   → { accessToken, refreshToken, user }

2. Client sends: Authorization: Bearer <accessToken>
   → valid for 60 minutes

3. On 401, client calls POST /api/auth/refresh-token
   with { refreshToken }
   → { accessToken, refreshToken (rotated) }

4. POST /api/auth/logout
   → revokes all refresh tokens for the user
```

### Token Details

**Access Token**
- Algorithm: HS256
- Lifetime: 60 min (configurable via `JwtSettings:ExpirationMinutes`)
- Claims: `sub`, `email`, `jti`, `userId`, `ClaimTypes.Role`, `isAdmin`

**Refresh Token**
- 64 bytes of cryptographically secure random data
- URL-safe base64 encoding
- **Stored as SHA-256 hash** in `RefreshTokens.Token`
- Lifetime: 7 days
- **Rotated** on every refresh (old one revoked)

**Password Reset Token**
- 64 bytes of cryptographically secure random data
- **Stored as SHA-256 hash** in `PasswordResetTokens.Token`
- Lifetime: 1 hour
- Single-use (`UsedAt` timestamp)

### Password Hashing

BCrypt with default cost (work factor 11).

```csharp
var hash = PasswordHelper.HashPassword("plaintext");
var isValid = PasswordHelper.VerifyPassword("plaintext", hash);
```

### Rate Limiting

Configured in `appsettings.json` under `IpRateLimiting`:

| Endpoint | Limit | Period |
|----------|-------|--------|
| `POST /api/auth/login` | 5 | 1 min |
| `POST /api/auth/register` | 3 | 1 min |
| `POST /api/auth/forgot-password` | 3 | 1 hour |
| `POST /api/auth/reset-password` | 5 | 1 hour |
| `POST /api/auth/refresh-token` | 10 | 1 min |

Exceeded limits return **HTTP 429**.

---

## 🌐 API Endpoints

> Full interactive docs at `/swagger` when running in Development.

### Auth
| Method | Route | Auth |
|--------|-------|------|
| `POST` | `/api/auth/login` | — |
| `POST` | `/api/auth/register` | — |
| `POST` | `/api/auth/refresh-token` | — |
| `POST` | `/api/auth/logout` | ✅ |
| `POST` | `/api/auth/forgot-password` | — |
| `POST` | `/api/auth/reset-password` | — |

### Users
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/users/profile` | ✅ |
| `PUT` | `/api/users/profile` | ✅ |
| `POST` | `/api/users/change-password` | ✅ |
| `GET` | `/api/users` | 👑 Admin |
| `GET` | `/api/users/{id}` | 👑 Admin |
| `PUT` | `/api/users/{id}` | 👑 Admin |
| `DELETE` | `/api/users/{id}` | 👑 Admin |

### Spaces
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/spaces` | — |
| `GET` | `/api/spaces/all` | — |
| `GET` | `/api/spaces/featured` | — |
| `GET` | `/api/spaces/available` | — |
| `GET` | `/api/spaces/search` | — |
| `GET` | `/api/spaces/{id}` | — |
| `GET` | `/api/spaces/{id}/availability` | — |
| `POST` | `/api/spaces` | 👑 Admin |
| `PUT` | `/api/spaces/{id}` | 👑 Admin |
| `DELETE` | `/api/spaces/{id}` | 👑 Admin |

### Reservations
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/reservations/user` | ✅ |
| `GET` | `/api/reservations/user/filtered` | ✅ |
| `GET` | `/api/reservations/user/upcoming` | ✅ |
| `GET` | `/api/reservations/user/summary` | ✅ |
| `GET` | `/api/reservations/{id}` | ✅ |
| `POST` | `/api/reservations` | ✅ |
| `PUT` | `/api/reservations/{id}` | ✅ |
| `POST` | `/api/reservations/{id}/cancel` | ✅ |
| `GET` | `/api/reservations/active` | 👑 Admin |
| `GET` | `/api/reservations/admin/all` | 👑 Admin |
| `POST` | `/api/reservations/{id}/confirm` | 👑 Admin |

### Pre-Reservations (Cart)
| Method | Route | Auth |
|--------|-------|------|
| `POST` | `/api/prereservations` | ✅ |
| `GET` | `/api/prereservations/{id}` | ✅ |
| `GET` | `/api/prereservations/user` | ✅ |
| `GET` | `/api/prereservations/cart/{sessionId}` | ✅ |
| `POST` | `/api/prereservations/payment` | ✅ |
| `POST` | `/api/prereservations/confirm` | ✅ |
| `POST` | `/api/prereservations/{id}/cancel` | ✅ |

### Alerts
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/alerts` | ✅ |
| `GET` | `/api/alerts/unread` | ✅ |
| `GET` | `/api/alerts/unread/count` | ✅ |
| `GET` | `/api/alerts/summary` | ✅ |
| `PUT` | `/api/alerts/{id}/read` | ✅ |
| `PUT` | `/api/alerts/read-all` | ✅ |
| `DELETE` | `/api/alerts/{id}` | ✅ |
| `POST` | `/api/alerts` | 👑 Admin |

### Amenities
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/amenities` | 👑 Admin |
| `GET` | `/api/amenities/active` | — |
| `GET` | `/api/amenities/{id}` | 👑 Admin |
| `GET` | `/api/amenities/search` | 👑 Admin |
| `POST` | `/api/amenities` | 👑 Admin |
| `PUT` | `/api/amenities/{id}` | 👑 Admin |
| `DELETE` | `/api/amenities/{id}` | 👑 Admin |
| `PATCH` | `/api/amenities/{id}/toggle` | 👑 Admin |

### Admin
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/admin/dashboard` | 👑 Admin |
| `GET` | `/api/admin/summary` | 👑 Admin |
| `GET` | `/api/admin/monthly-reservations` | 👑 Admin |
| `GET` | `/api/admin/monthly-revenue` | 👑 Admin |
| `GET` | `/api/admin/recent-reservations` | 👑 Admin |
| `GET` | `/api/admin/top-users` | 👑 Admin |
| `GET` | `/api/admin/top-spaces` | 👑 Admin |
| `GET` | `/api/admin/health` | 👑 Admin |
| `GET` | `/api/admin/export` | 👑 Admin |
| `GET` | `/api/admin/alerts` | 👑 Admin |
| `GET` | `/api/admin/alerts/stats` | 👑 Admin |
| `POST` | `/api/admin/alerts/broadcast` | 👑 Admin |

---

## 📐 Conventions

### Naming
- Classes / Methods / Properties: **PascalCase**
- Private fields: `_camelCase`
- Async methods: `...Async` suffix
- Interfaces: `I` prefix

### Controllers
- **Thin** — no business logic
- Delegate to services
- Use `[Authorize]` / `[AllowAnonymous]`
- Extract user ID via `User.GetUserId()` extension (never `int.Parse(... ?? "0")`)
- Never `try/catch` — let middleware handle exceptions

### Services
- One interface per service
- Return DTOs, never entities
- Throw domain exceptions (`BusinessException`, `NotFoundException`, `ForbiddenException`)
- Use `_logger` for meaningful events (not every line)

### Repositories
- Extend `GenericRepository<T>` for CRUD
- Add specialized methods via interfaces
- Include related entities explicitly (`Include(...)`)

### DTOs
- Request DTOs: `{Entity}RequestDto`
- Response DTOs: `{Entity}ResponseDto`
- Use `DataAnnotations` for validation

---

## 🧪 Testing

> ⚠️ Automated tests are on the roadmap.

Currently relying on:
- Swagger UI for manual API testing
- Postman collections (not included)
- Integration testing via the frontend

Planned:
- `KineticWorkspace.Tests` project with xUnit + FluentAssertions
- In-memory DB for fast unit tests
- Testcontainers for integration tests

---

<div align="center">

**[⬆ Back to top](#-kinetic-workspace--backend)** · **[📖 Main README](../README.md)**

</div># 🔧 Kinetic Workspace — Backend

ASP.NET Core 8 Web API for the Kinetic Workspace booking platform.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![EF Core](https://img.shields.io/badge/EF%20Core-8-512BD4)](https://learn.microsoft.com/en-us/ef/core/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

---

## 📋 Table of Contents

- [Requirements](#-requirements)
- [Setup](#-setup)
- [Configuration](#-configuration)
- [Running](#-running)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Database](#-database)
- [Authentication](#-authentication)
- [API Endpoints](#-api-endpoints)
- [Conventions](#-conventions)
- [Testing](#-testing)

---

## 🧰 Requirements

| Tool | Version |
|------|---------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0+ |
| [MySQL](https://dev.mysql.com/downloads/) | 8.0+ |
| [EF Core CLI](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) | `dotnet tool install --global dotnet-ef` |

---

## 🚀 Setup

### 1. Restore dependencies

```bash
cd backend/KineticWorkspace.API
dotnet restore
```

### 2. Create `.env` file

Create a `.env` file **in the same directory as `KineticWorkspace.API.csproj`**:

```env
# Database
ConnectionStrings__DefaultConnection=Server=localhost;Port=3306;Database=kinetic_workspace;User=root;Password=YOUR_PASSWORD;

# JWT (SecretKey MUST be at least 32 characters; use 64+ for production)
JwtSettings__SecretKey=CHANGE_ME_64_CHAR_RANDOM_STRING_HERE_ABCDEF1234567890
JwtSettings__Issuer=KineticWorkspace
JwtSettings__Audience=KineticWorkspaceAPI
JwtSettings__ExpirationMinutes=60

# CORS (indexed keys for arrays)
CorsSettings__AllowedOrigins__0=http://localhost:5173

# Frontend URL (used for password reset links)
AppSettings__FrontendUrl=http://localhost:5173
```

> 🔐 **Never commit `.env`** — it's already in `.gitignore`.

### 3. Apply migrations

```bash
dotnet ef database update
```

### 4. Run

```bash
dotnet run
```

- **API**: http://localhost:5134
- **Swagger**: http://localhost:5134/swagger
- **Health**: http://localhost:5134/health

---

## ⚙️ Configuration

### Configuration Precedence

`Program.cs` loads configuration in this order (later sources override earlier):

1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. **User Secrets** (Development only)
4. **Environment variables** (from `.env` via `DotNetEnv`)
5. **Command-line arguments**

### Required Configuration

`ValidateRequiredConfiguration()` fails fast at startup if any of these are missing:

| Key | Constraint |
|-----|-----------|
| `JwtSettings:SecretKey` | ≥ 32 characters |
| `ConnectionStrings:DefaultConnection` | non-empty |
| `CorsSettings:AllowedOrigins` | ≥ 1 origin |

### Environment Files

| File | Purpose |
|------|---------|
| `.env` | Local secrets (gitignored) |
| `appsettings.json` | Committed defaults |
| `appsettings.Development.json` | Dev overrides (verbose logging) |

---

## 🏃 Running

### Development

```bash
dotnet run
```

Automatically:
- Applies pending migrations
- Seeds 75 spaces, amenities, admin + test users
- Enables Swagger UI
- Enables detailed EF logging
- Enables sensitive data logging (⚠️ dev only)

### Production

```bash
dotnet publish -c Release -o ./publish
cd publish
ASPNETCORE_ENVIRONMENT=Production dotnet KineticWorkspace.API.dll
```

In Production:
- Migrations are **skipped** at startup (apply via CI/CD)
- HTTPS redirection is enabled
- Swagger is disabled
- CORS rejects `localhost` origins

---

## 📁 Project Structure

```
KineticWorkspace.API/
├── Controllers/                   # API endpoints
│   ├── AuthController.cs
│   ├── UsersController.cs
│   ├── SpacesController.cs
│   ├── ReservationsController.cs
│   ├── PreReservationsController.cs
│   ├── AlertsController.cs
│   ├── AmenitiesController.cs
│   └── AdminController.cs
│
├── Services/
│   ├── Interfaces/                # Service contracts
│   └── Implementations/           # Service logic
│       ├── Admin/                 # Admin dashboard, reports, alerts
│       ├── Payments/              # Payment processing + invoicing
│       ├── Reservations/          # User + admin reservation services
│       ├── Spaces/                # Availability + amenities
│       └── Users/                 # Profile + admin user services
│
├── Repositories/
│   ├── Interfaces/
│   └── Implementations/
│       ├── GenericRepository.cs   # Reusable CRUD base
│       └── *Repository.cs         # Specialized repos
│
├── Models/
│   ├── Entities/                  # EF Core entities
│   └── DTOs/                      # Request/response contracts
│       ├── Admin/
│       ├── Alerts/
│       ├── Amenities/
│       ├── Auth/
│       ├── PreReservations/
│       ├── Reservations/
│       ├── Spaces/
│       └── Users/
│
├── Data/
│   ├── ApplicationDbContext.cs
│   ├── Configurations/            # IEntityTypeConfiguration<T>
│   ├── SeedData/
│   │   ├── SeedCatalogs/          # Static seed data
│   │   └── Seeders/               # ISeeder implementations
│   └── DataSeeder.cs              # Orchestrator
│
├── Helpers/
│   ├── JwtHelper.cs
│   ├── PasswordHelper.cs
│   ├── TokenHasher.cs
│   ├── Formatting/TimeAgoFormatter.cs
│   ├── Pricing/PricingCalculator.cs
│   └── Validation/ReservationDateValidator.cs
│
├── Extensions/                    # DI + middleware registration
│   ├── CorsExtensions.cs
│   ├── DatabaseExtensions.cs
│   ├── DatabaseInitializationExtensions.cs
│   ├── DependencyInjectionExtensions.cs
│   ├── ExceptionMiddlewareExtensions.cs
│   ├── HealthCheckExtensions.cs
│   ├── JwtExtensions.cs
│   ├── RateLimitingExtensions.cs
│   ├── SerilogExtensions.cs
│   ├── SwaggerExtensions.cs
│   └── ClaimsPrincipalExtensions.cs
│
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs
│
├── Exceptions/
│   ├── AppException.cs            # Abstract base with StatusCode
│   ├── BusinessException.cs       # 400
│   ├── ForbiddenException.cs      # 403
│   ├── NotFoundException.cs       # 404
│   └── UnauthorizedException.cs   # 401
│
├── Mappings/
│   ├── MappingProfile.cs          # AutoMapper profile
│   └── Resolvers/                 # Custom value resolvers
│
├── Migrations/                    # EF Core migrations
├── Program.cs
└── KineticWorkspace.API.csproj
```

---

## 🏛️ Architecture

### Layering

```
HTTP Request
    ↓
[Middleware]  ExceptionHandlingMiddleware
    ↓
[Controller]  Thin — delegates to services
    ↓
[Service]     Business logic
              Facades compose specialized services
    ↓
[Repository]  Data access via EF Core
    ↓
[DbContext]   ApplicationDbContext
    ↓
[MySQL]       Persistence
```

### Service Facades

Some controllers inject **facade interfaces** that delegate to specialized services. This keeps controllers stable while allowing service decomposition:

| Facade | Delegates to |
|--------|--------------|
| `IReservationService` | `IUserReservationService`, `IAdminReservationService` |
| `IUserService` | `IUserProfileService`, `IUserAdminService` |
| `IAdminService` | `IAdminDashboardService`, `IAdminReportService`, `IAdminAlertService` |
| `ISpaceService` | `ISpaceAvailabilityService`, `ISpaceAmenityService` |

### Exception Handling

Domain exceptions inherit from `AppException`:

```csharp
public abstract class AppException : Exception
{
    public abstract int StatusCode { get; }
}
```

`ExceptionHandlingMiddleware` translates them to HTTP status codes:

| Exception | Status |
|-----------|--------|
| `BusinessException` | 400 |
| `UnauthorizedException` / `UnauthorizedAccessException` | 401 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `InvalidOperationException` | 400 (backward compat) |
| Any other | 500 |

### Transaction Handling

Complex operations (e.g., payment confirmation) use EF's execution strategy + explicit transactions:

```csharp
var strategy = _context.Database.CreateExecutionStrategy();
return await strategy.ExecuteAsync(async () =>
{
    await using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // ... atomic operations
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
});
```

---

## 🗄️ Database

### Entities

| Entity | Purpose |
|--------|---------|
| `User` | Accounts (users + admins) |
| `Space` | Bookable workspaces |
| `Reservation` | Confirmed bookings |
| `PreReservation` | 30-minute cart hold |
| `Payment` | Payment records |
| `Invoice` | Generated invoices with per-year counter |
| `Amenity` | Space features (WiFi, projector, etc.) |
| `Review` | Space ratings (1–5) |
| `Alert` | In-app notifications |
| `RefreshToken` | JWT refresh tokens (hashed) |
| `PasswordResetToken` | Password reset tokens (hashed) |
| `AuditLog` | Audit trail (optional) |
| `InvoiceCounter` | Atomic per-year invoice numbering |

### Migrations

```bash
# Add a new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Roll back to a specific migration
dotnet ef database update PreviousMigrationName

# List migrations
dotnet ef migrations list

# Remove last migration (if not applied)
dotnet ef migrations remove
```

### Seeding

Seeding runs **only in Development** and is idempotent:

| Seeder | Creates |
|--------|---------|
| `AmenitySeeder` | ~25 unique amenities |
| `SpaceSeeder` | 75 spaces (15 per type × 5 types) |
| `AdminUserSeeder` | 1 admin |
| `SeederDataUser` | 1 test user + 15 reservations + payments |

To reset the database:
```bash
dotnet ef database drop
dotnet ef database update
dotnet run
```

---

## 🔐 Authentication

### Flow

```
1. POST /api/auth/login
   → { accessToken, refreshToken, user }

2. Client sends: Authorization: Bearer <accessToken>
   → valid for 60 minutes

3. On 401, client calls POST /api/auth/refresh-token
   with { refreshToken }
   → { accessToken, refreshToken (rotated) }

4. POST /api/auth/logout
   → revokes all refresh tokens for the user
```

### Token Details

**Access Token**
- Algorithm: HS256
- Lifetime: 60 min (configurable via `JwtSettings:ExpirationMinutes`)
- Claims: `sub`, `email`, `jti`, `userId`, `ClaimTypes.Role`, `isAdmin`

**Refresh Token**
- 64 bytes of cryptographically secure random data
- URL-safe base64 encoding
- **Stored as SHA-256 hash** in `RefreshTokens.Token`
- Lifetime: 7 days
- **Rotated** on every refresh (old one revoked)

**Password Reset Token**
- 64 bytes of cryptographically secure random data
- **Stored as SHA-256 hash** in `PasswordResetTokens.Token`
- Lifetime: 1 hour
- Single-use (`UsedAt` timestamp)

### Password Hashing

BCrypt with default cost (work factor 11).

```csharp
var hash = PasswordHelper.HashPassword("plaintext");
var isValid = PasswordHelper.VerifyPassword("plaintext", hash);
```

### Rate Limiting

Configured in `appsettings.json` under `IpRateLimiting`:

| Endpoint | Limit | Period |
|----------|-------|--------|
| `POST /api/auth/login` | 5 | 1 min |
| `POST /api/auth/register` | 3 | 1 min |
| `POST /api/auth/forgot-password` | 3 | 1 hour |
| `POST /api/auth/reset-password` | 5 | 1 hour |
| `POST /api/auth/refresh-token` | 10 | 1 min |

Exceeded limits return **HTTP 429**.

---

## 🌐 API Endpoints

> Full interactive docs at `/swagger` when running in Development.

### Auth
| Method | Route | Auth |
|--------|-------|------|
| `POST` | `/api/auth/login` | — |
| `POST` | `/api/auth/register` | — |
| `POST` | `/api/auth/refresh-token` | — |
| `POST` | `/api/auth/logout` | ✅ |
| `POST` | `/api/auth/forgot-password` | — |
| `POST` | `/api/auth/reset-password` | — |

### Users
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/users/profile` | ✅ |
| `PUT` | `/api/users/profile` | ✅ |
| `POST` | `/api/users/change-password` | ✅ |
| `GET` | `/api/users` | 👑 Admin |
| `GET` | `/api/users/{id}` | 👑 Admin |
| `PUT` | `/api/users/{id}` | 👑 Admin |
| `DELETE` | `/api/users/{id}` | 👑 Admin |

### Spaces
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/spaces` | — |
| `GET` | `/api/spaces/all` | — |
| `GET` | `/api/spaces/featured` | — |
| `GET` | `/api/spaces/available` | — |
| `GET` | `/api/spaces/search` | — |
| `GET` | `/api/spaces/{id}` | — |
| `GET` | `/api/spaces/{id}/availability` | — |
| `POST` | `/api/spaces` | 👑 Admin |
| `PUT` | `/api/spaces/{id}` | 👑 Admin |
| `DELETE` | `/api/spaces/{id}` | 👑 Admin |

### Reservations
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/reservations/user` | ✅ |
| `GET` | `/api/reservations/user/filtered` | ✅ |
| `GET` | `/api/reservations/user/upcoming` | ✅ |
| `GET` | `/api/reservations/user/summary` | ✅ |
| `GET` | `/api/reservations/{id}` | ✅ |
| `POST` | `/api/reservations` | ✅ |
| `PUT` | `/api/reservations/{id}` | ✅ |
| `POST` | `/api/reservations/{id}/cancel` | ✅ |
| `GET` | `/api/reservations/active` | 👑 Admin |
| `GET` | `/api/reservations/admin/all` | 👑 Admin |
| `POST` | `/api/reservations/{id}/confirm` | 👑 Admin |

### Pre-Reservations (Cart)
| Method | Route | Auth |
|--------|-------|------|
| `POST` | `/api/prereservations` | ✅ |
| `GET` | `/api/prereservations/{id}` | ✅ |
| `GET` | `/api/prereservations/user` | ✅ |
| `GET` | `/api/prereservations/cart/{sessionId}` | ✅ |
| `POST` | `/api/prereservations/payment` | ✅ |
| `POST` | `/api/prereservations/confirm` | ✅ |
| `POST` | `/api/prereservations/{id}/cancel` | ✅ |

### Alerts
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/alerts` | ✅ |
| `GET` | `/api/alerts/unread` | ✅ |
| `GET` | `/api/alerts/unread/count` | ✅ |
| `GET` | `/api/alerts/summary` | ✅ |
| `PUT` | `/api/alerts/{id}/read` | ✅ |
| `PUT` | `/api/alerts/read-all` | ✅ |
| `DELETE` | `/api/alerts/{id}` | ✅ |
| `POST` | `/api/alerts` | 👑 Admin |

### Amenities
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/amenities` | 👑 Admin |
| `GET` | `/api/amenities/active` | — |
| `GET` | `/api/amenities/{id}` | 👑 Admin |
| `GET` | `/api/amenities/search` | 👑 Admin |
| `POST` | `/api/amenities` | 👑 Admin |
| `PUT` | `/api/amenities/{id}` | 👑 Admin |
| `DELETE` | `/api/amenities/{id}` | 👑 Admin |
| `PATCH` | `/api/amenities/{id}/toggle` | 👑 Admin |

### Admin
| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/admin/dashboard` | 👑 Admin |
| `GET` | `/api/admin/summary` | 👑 Admin |
| `GET` | `/api/admin/monthly-reservations` | 👑 Admin |
| `GET` | `/api/admin/monthly-revenue` | 👑 Admin |
| `GET` | `/api/admin/recent-reservations` | 👑 Admin |
| `GET` | `/api/admin/top-users` | 👑 Admin |
| `GET` | `/api/admin/top-spaces` | 👑 Admin |
| `GET` | `/api/admin/health` | 👑 Admin |
| `GET` | `/api/admin/export` | 👑 Admin |
| `GET` | `/api/admin/alerts` | 👑 Admin |
| `GET` | `/api/admin/alerts/stats` | 👑 Admin |
| `POST` | `/api/admin/alerts/broadcast` | 👑 Admin |

---

## 📐 Conventions

### Naming
- Classes / Methods / Properties: **PascalCase**
- Private fields: `_camelCase`
- Async methods: `...Async` suffix
- Interfaces: `I` prefix

### Controllers
- **Thin** — no business logic
- Delegate to services
- Use `[Authorize]` / `[AllowAnonymous]`
- Extract user ID via `User.GetUserId()` extension (never `int.Parse(... ?? "0")`)
- Never `try/catch` — let middleware handle exceptions

### Services
- One interface per service
- Return DTOs, never entities
- Throw domain exceptions (`BusinessException`, `NotFoundException`, `ForbiddenException`)
- Use `_logger` for meaningful events (not every line)

### Repositories
- Extend `GenericRepository<T>` for CRUD
- Add specialized methods via interfaces
- Include related entities explicitly (`Include(...)`)

### DTOs
- Request DTOs: `{Entity}RequestDto`
- Response DTOs: `{Entity}ResponseDto`
- Use `DataAnnotations` for validation

---

## 🧪 Testing

> ⚠️ Automated tests are on the roadmap.

Currently relying on:
- Swagger UI for manual API testing
- Postman collections (not included)
- Integration testing via the frontend

Planned:
- `KineticWorkspace.Tests` project with xUnit + FluentAssertions
- In-memory DB for fast unit tests
- Testcontainers for integration tests

---

<div align="center">

**[⬆ Back to top](#-kinetic-workspace--backend)** · **[📖 Main README](../README.md)**

</div>