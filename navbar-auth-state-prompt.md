# SmartCampus — Navbar Auth State Change Prompt

> **කෙටි විස්තරය (Summary)**  
> Unregistered / Logged-out user ට homepage navbar පෙනෙනවා.  
> Login / Register කළාට පස්සේ dashboard navbar ට switch වෙනවා.  
> මේ prompt එක frontend developer ට දෙන්න — navbar component දෙකක් හදන්නට.

---

## 🔀 Navbar — Two States

### STATE 1 — Unauthenticated (Guest User)
> *Homepage (`/`) — Login කරලා නැති user ට*

**Design reference**: Image 1 (SLIIT Smart Campus homepage)

```
Background:  #1B2A4A  (dark navy)
Height:      64px
Position:    Sticky top

LEFT SIDE:
  - Logo: White box → "SLIIT" (bold white) + "UNI" (bold #F5A623 yellow)
  - Brand text: "Smart Campus" — white, Montserrat 600, 16px

CENTER LINKS:
  - Home (active: yellow underline #F5A623)
  - Resources
  - Bookings
  - Tickets
  - About
  Font: Inter 500, 15px, white

RIGHT SIDE:
  - "Report Item" button → yellow pill (#F5A623), navy text, bold
  - "Login" → white text link
  - "Register" → white outlined pill button
```

**Behavior:**
- Scroll > 80px → `box-shadow: 0 2px 20px rgba(0,0,0,0.2)` add වෙනවා
- Mobile (<768px) → hamburger menu icon, links drawer ට යනවා

---

### STATE 2 — Authenticated (Logged-in Student)
> *Dashboard (`/dashboard`) — Login කරපු user ට*

**Design reference**: Image 2 (SmartCampus dashboard)

```
Background:  #1a1a2e  (very dark navy / almost black)
Height:      60px
Position:    Sticky top

LEFT SIDE:
  - SmartCampus logo (colourful icon) + "SmartCampus" text — white, bold

CENTER LINKS (tab-style with active highlight):
  - Home
  - Resources
  - Bookings
  - Tickets  ← (active state: pill highlight, slightly lighter bg)
  - Profile
  Font: Inter 500, 14px, white

RIGHT SIDE:
  - 🔔 Bell icon button
      → Badge: red dot with count (e.g. "2")
      → `background: rgba(255,255,255,0.08)`, rounded square
  - Avatar circle (user initials or photo)
      → Teal/purple gradient background
      → Click → dropdown: Profile, Settings, Logout
```

**Behavior:**
- Active nav tab → pill shape bg `rgba(255,255,255,0.12)`, white text
- Bell icon click → notification dropdown panel
- Avatar click → user menu dropdown

---

## ⚙️ Implementation — React Component

### File: `Navbar.jsx`

```jsx
// Pseudo-code structure — implement with your auth system

import { useAuth } from '@/hooks/useAuth'
import { useLocation } from 'react-router-dom'

export default function Navbar() {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isAuthenticated) {
    return <AuthenticatedNav user={user} currentPath={location.pathname} />
  }

  return <GuestNav />
}
```

### Two Sub-Components:

| Component | Shown when | Route |
|---|---|---|
| `<GuestNav />` | `isAuthenticated === false` | `/`, `/about`, `/login`, `/register` |
| `<AuthenticatedNav />` | `isAuthenticated === true` | `/dashboard`, `/resources`, `/bookings`, `/tickets`, `/profile` |

---

## 🎨 Color Tokens — Navbar Specific

```css
/* Guest Navbar */
--nav-guest-bg:        #1B2A4A;
--nav-guest-text:      #FFFFFF;
--nav-guest-active:    #F5A623;
--nav-guest-btn-bg:    #F5A623;
--nav-guest-btn-text:  #1B2A4A;

/* Auth Navbar */
--nav-auth-bg:         #1a1a2e;
--nav-auth-text:       rgba(255,255,255,0.85);
--nav-auth-active-bg:  rgba(255,255,255,0.12);
--nav-auth-active-text:#FFFFFF;
--nav-auth-icon-bg:    rgba(255,255,255,0.08);
--nav-auth-badge:      #EF4444;
```

---

## 📱 Responsive Behavior

| Breakpoint | Guest Nav | Auth Nav |
|---|---|---|
| Desktop `>1024px` | Full links + buttons | Full links + icons |
| Tablet `640–1024px` | Hamburger menu | Hamburger menu |
| Mobile `<640px` | Hamburger → slide drawer | Bottom tab bar (5 items) |

### Mobile Bottom Tab Bar (Auth only):
```
Icons: Home · Resources · Bookings · Tickets · Profile
Active: yellow icon + label
Inactive: muted white
Background: #1a1a2e, border-top 1px rgba(255,255,255,0.08)
```

---

## 🔄 Transition Animation

Login සාර්ථකව වුනාට පස්සේ:

```
1. GuestNav → fade out (opacity 0, 150ms)
2. Redirect to /dashboard
3. AuthNav → fade in (opacity 1, 200ms)
```

Use Framer Motion `AnimatePresence` or simple CSS transition.

---

## ✅ Developer Checklist

- [ ] `GuestNav.jsx` — logo + center links + right buttons
- [ ] `AuthNav.jsx` — logo + tab links + bell + avatar
- [ ] `Navbar.jsx` — conditional render based on `isAuthenticated`
- [ ] `NotificationBadge.jsx` — bell + count + dropdown
- [ ] `UserMenu.jsx` — avatar + dropdown (Profile / Logout)
- [ ] `MobileDrawer.jsx` — hamburger slide-out menu (Guest)
- [ ] `BottomTabBar.jsx` — mobile fixed bottom nav (Auth)
- [ ] Auth state connected via `useAuth()` hook or Redux/Zustand store

---

## 🖼 Visual Reference Summary

| | Guest (Unauthenticated) | Auth (Logged In) |
|---|---|---|
| **BG color** | `#1B2A4A` navy | `#1a1a2e` dark |
| **Logo** | SLIIT UNI badge + Smart Campus | SmartCampus icon + text |
| **Nav links** | Home, Resources, Bookings, Tickets, About | Home, Resources, Bookings, Tickets, Profile |
| **Active style** | Yellow bottom underline | Pill highlight bg |
| **Right side** | Report Item btn + Login + Register | Bell icon (badge) + Avatar |
| **Mobile** | Hamburger drawer | Bottom tab bar |
