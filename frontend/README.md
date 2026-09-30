# 🎨 Kinetic Workspace — Frontend

React 19 + Vite 8 + Tailwind CSS 3 SPA for the Kinetic Workspace booking platform.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Requirements](#-requirements)
- [Setup](#-setup)
- [Running](#-running)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [State Management](#-state-management)
- [API Layer](#-api-layer)
- [Theming](#-theming)
- [Conventions](#-conventions)
- [Build](#-build)

---

## 🧰 Requirements

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | 20+ |
| npm | 10+ |

---

## 🚀 Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Verify backend is running

The Vite dev server proxies `/api/*` to `http://localhost:5134`. Make sure the backend is up.

### 3. Run

```bash
npm run dev
```

Frontend at **http://localhost:5173**.

---

## 🏃 Running

### Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

### Dev server

- Port: `5173`
- Proxy: `/api` → `http://localhost:5134`
- HMR enabled
- Source maps enabled

---

## 📁 Project Structure

```
frontend/src/
├── api/
│   ├── config/
│   │   ├── publicEndpoints.js       # Endpoints that skip auth
│   │   ├── refreshTokenHandler.js   # Token refresh logic
│   │   └── tokenStorage.js          # localStorage abstraction
│   ├── helpers/
│   │   └── request.js               # axios wrappers (returns data directly)
│   ├── axios.config.js              # axios instance + interceptors
│   ├── admin.service.js
│   ├── alerts.service.js
│   ├── amenities.service.js
│   ├── auth.service.js
│   ├── pre-reservations.service.js
│   ├── reservations.service.js
│   ├── spaces.service.js
│   └── users.service.js
│
├── components/
│   ├── admin/                       # Admin-only components
│   │   ├── AdminEmptyState.jsx
│   │   ├── AdminHeader.jsx
│   │   ├── AdminPagination.jsx
│   │   ├── AdminStatsCards.jsx
│   │   ├── AdminTable.jsx
│   │   ├── AmenityModal.jsx
│   │   └── DeleteConfirmModal.jsx
│   ├── cart/
│   │   ├── PaymentModal.jsx
│   │   └── payment/
│   │       ├── ConfirmStep.jsx
│   │       ├── PaymentStep.jsx
│   │       ├── ProcessingStep.jsx
│   │       └── ResultStep.jsx
│   ├── common/
│   │   ├── AlertBell.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── ThemeToggle.jsx
│   ├── layout/
│   │   └── MainLayout.jsx
│   ├── profile/
│   │   ├── ProfileContact.jsx
│   │   ├── ProfileHelp.jsx
│   │   ├── ProfileOverview.jsx
│   │   ├── ProfileSecurity.jsx
│   │   └── ProfileSettings.jsx
│   ├── reservations/
│   │   └── ReservationDetailModal.jsx
│   └── ui/
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       └── Select.jsx
│
├── context/
│   ├── AlertContext.jsx             # Notifications + unread count
│   ├── AuthContext.jsx              # User session + login/logout
│   ├── CartContext.jsx              # Pre-reservations cart
│   └── ThemeContext.jsx             # Light/dark mode
│
├── hooks/
│   ├── useAlertPolling.js           # Count + summary polling
│   ├── useCartRefresh.js            # Post-payment cart refresh
│   ├── useDebounce.js               # Debounced value for search
│   ├── useFilters.js                # Filter state helper
│   ├── usePagination.js             # Client-side pagination
│   └── useTheme.js                  # Re-export of context hook
│
├── pages/
│   ├── About.jsx
│   ├── AdminAlerts.jsx
│   ├── AdminAmenities.jsx
│   ├── AdminDashboard.jsx
│   ├── AdminReservations.jsx
│   ├── AdminSpaces.jsx
│   ├── AdminUsers.jsx
│   ├── Alerts.jsx
│   ├── CartPage.jsx
│   ├── Catalog.jsx
│   ├── Contact.jsx
│   ├── ForgotPassword.jsx
│   ├── HelpCenter.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── NotFound.jsx
│   ├── PrivacyPolicy.jsx
│   ├── Profile.jsx
│   ├── Register.jsx
│   ├── Reservations.jsx
│   ├── ResetPassword.jsx
│   ├── SpaceDetails.jsx
│   └── TermsOfService.jsx
│
├── utils/
│   ├── authStorage.js               # Session persistence
│   ├── cartSession.js               # Cart session ID
│   ├── dateFormatter.js             # Locale-aware date formatting
│   ├── profileStatistics.js         # Analytics calculations
│   ├── statusBadge.js               # Reservation status styling
│   ├── timeAgo.js                   # Relative timestamps
│   └── typeBadge.js                 # Alert type styling
│
├── App.jsx                          # Provider composition
├── AppRoutes.jsx                    # Route definitions
├── index.css                        # Tailwind + CSS variables
└── main.jsx                         # Entry point
```

---

## 🏛️ Architecture

### Provider Composition

`App.jsx` wraps the tree with contexts in dependency order:

```
<ThemeProvider>          ← no dependencies
  <AuthProvider>         ← no dependencies
    <CartProvider>       ← depends on Auth
      <AlertProvider>    ← depends on Auth
        <AppRoutes />
        <Toaster />
        <ThemeToggle />
```

### Route Guarding

`AppRoutes.jsx` uses two guard components:

| Guard | Behavior |
|-------|----------|
| `ProtectedRoute` | Redirects to `/login` if not authenticated |
| `AdminRoute` | Redirects to `/login` if not authenticated, `/` if not admin |

**Public routes** (no guard):
- `/`, `/catalog`, `/spaces/:id`
- `/about`, `/privacy`, `/terms`, `/help`, `/contact`
- `/login`, `/register`, `/forgot-password`, `/reset-password`

**Protected routes**:
- `/profile`, `/reservations`, `/cart`, `/alerts`

**Admin routes**:
- `/admin/*`

### Data Flow

```
Component
  ↓ calls
Context action (e.g. addToCart)
  ↓ calls
API service (e.g. preReservationsService.create)
  ↓ calls
request wrapper → axios instance
  ↓ interceptors add token, log, handle 401
HTTP → Backend
  ↓
Response → interceptor → service → context → component
```

---

## 🧠 State Management

Four React contexts, each with a focused concern:

### `AuthContext`
```jsx
const { user, isAuthenticated, loading, login, register, logout } = useAuth();
```

- Restores session from `localStorage` on mount
- Persists tokens via `authStorage.js`
- Exposes `isAdmin` derived from `user.isAdmin`

### `CartContext`
```jsx
const { cartItems, addToCart, processPayment, confirmPayment, clearCart, getTotal } = useCart();
```

- Manages pre-reservation cart
- Uses a **persistent `sessionId`** (`cartSession.js`) to survive page reloads
- Loads cart on auth change

### `AlertContext`
```jsx
const { alerts, unreadCount, markAsRead, markAllAsRead, deleteAlert } = useAlerts();
```

- Polls unread count + summary via `useAlertPolling`
- Optimistic updates for read/delete operations

### `ThemeContext`
```jsx
const { theme, toggleTheme, isDark } = useTheme();
```

- Persists preference to `localStorage`
- Detects system preference on first load
- Applies `dark` class to `<html>`

---

## 🌐 API Layer

### Two-layer pattern

**1. Axios instance** (`axios.config.js`)
- `baseURL: '/api'`
- Request interceptor: attaches `Authorization` header unless endpoint is public
- Response interceptor: auto-refreshes access token on 401, retries original request

**2. Request wrapper** (`helpers/request.js`)
- Unwraps `response.data` so services don't deal with axios shape
- Services call `request.get('/path')` and receive the payload directly

### Public Endpoints

`config/publicEndpoints.js` declares which endpoints **don't require a token**:

```js
{ method: 'POST', path: '/auth/login' }
{ method: 'GET', path: '/spaces' }
// ...
```

Used by the request interceptor to skip the `Authorization` header (avoids spurious "no token" warnings).

### Token Refresh

When a request returns 401 (and isn't public), the interceptor:
1. Calls `POST /api/auth/refresh-token` with the stored refresh token
2. Stores the new access + refresh tokens
3. Retries the original request with the new access token
4. If refresh fails → clears session and redirects to `/login`

### Adding a New Service

```js
// api/things.service.js
import request from './helpers/request';

const API_URL = '/things';

export const thingsService = {
    getAll: () => request.get(API_URL),
    getById: (id) => request.get(`${API_URL}/${id}`),
    create: (data) => request.post(API_URL, data),
    update: (id, data) => request.put(`${API_URL}/${id}`, data),
    delete: (id) => request.delete(`${API_URL}/${id}`),
};

export default thingsService;
```

---

## 🎨 Theming

### Strategy

**Hybrid**: Tailwind color tokens + CSS custom properties.

- **Tailwind tokens** (`tailwind.config.js`): `primary`, `surface`, `on-surface`, etc.
- **CSS variables** (`index.css`): `--color-primary`, `--color-surface`, etc.
- **Dark mode**: `class`-based (`darkMode: 'class'` in Tailwind config)

### Applying Dark Mode

The root element gets a `dark` class:

```html
<html class="dark">
```

All styles use Tailwind's `dark:` variant:

```jsx
<div className="bg-surface dark:bg-surface-dark text-on-surface dark:text-on-dark-surface">
```

### Adding a New Color

1. Add to `tailwind.config.js`:
   ```js
   colors: {
       'my-color': '#ff0000',
       'my-color-dark': '#cc0000',
   }
   ```

2. (Optional) Add CSS variables in `index.css`:
   ```css
   :root { --color-my-color: #ff0000; }
   .dark { --color-my-color: #cc0000; }
   ```

3. Use in components:
   ```jsx
   <div className="text-my-color dark:text-my-color-dark">
   ```

---

## 📐 Conventions

### Naming
- Components: **PascalCase** file + function name (`Button.jsx` → `function Button()`)
- Hooks: `useXxx` camelCase
- Contexts: `XxxContext` file + `useXxx` hook export
- Services: `xxx.service.js` file, `xxxService` export
- Utils: camelCase file, camelCase exports

### Component Structure

```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import someService from '../api/some.service';
import toast from 'react-hot-toast';

// 2. Component
const MyComponent = ({ prop1, prop2 }) => {
    // 3. Hooks (order matters)
    const [state, setState] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // 4. Effects
    useEffect(() => { /* ... */ }, []);

    // 5. Handlers
    const handleClick = () => { /* ... */ };

    // 6. Derived values
    const total = useMemo(() => /* ... */, [/* deps */]);

    // 7. Early returns
    if (!user) return null;

    // 8. Render
    return ( /* ... */ );
};

export default MyComponent;
```

### JSX Rules
- **Never** put comments inside attribute braces: `value={x /* bad */}`
- Comments between elements: `{/* good */}`
- Prefer `const` over `let`
- One component per file

### Error Handling
- API errors → toast (`toast.error(error.response?.data?.message || 'fallback')`)
- Never expose raw error objects to the user
- Use `console.error` only for developer debugging

### Styling
- Prefer Tailwind utilities over custom CSS
- Use design tokens (`text-primary`, not `text-[#a03f28]`)
- Always provide dark variants: `bg-white dark:bg-gray-800`
- Use semantic spacing: `px-margin-desktop`, `max-w-container-max`

---

## 🏗️ Build

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

Outputs to `dist/`. Optimized, minified, tree-shaken, with hashed filenames.

### Preview production

```bash
npm run preview
```

### Environment variables

Vite exposes variables prefixed with `VITE_`:

```env
# .env.production
VITE_API_URL=https://api.your-domain.com
```

Access in code:
```js
const apiUrl = import.meta.env.VITE_API_URL;
```

### Deployment

Recommended platforms:
- **Vercel** — zero config, auto-detects Vite
- **Netlify** — set build command `npm run build`, publish dir `dist`
- **Cloudflare Pages** — same as Netlify

Make sure to configure the API proxy **or** set `VITE_API_URL` to the production backend.

---

<div align="center">

**[⬆ Back to top](#-kinetic-workspace--frontend)** · **[📖 Main README](../README.md)**

</div>