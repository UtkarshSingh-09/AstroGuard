# AstraGuard

AI-powered behavioral financial intelligence system that prevents common financial mistakes by combining deterministic financial calculations with real-time behavioral interventions.

## Project Overview

Built for the ET Gen AI Hackathon 2026. Features include:
- Behavioral DNA tracking (panic thresholds, emotional anchors)
- Consequence Binding (translating volatility into personal impact)
- 10 specialized AI agents via LangGraph orchestration
- Real-time WhatsApp alerts during market dips

## Tech Stack

- **Frontend**: React 19 + Vite 6
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion, GSAP, Motion
- **Routing**: React Router DOM 7
- **Package Manager**: npm

## Project Structure

```
src/
  App.jsx           # Root component with routing
  main.jsx          # Entry point
  index.css         # Global styles (Tailwind)
  components/
    layout/         # Navbar, etc.
    sections/       # Hero, AgentShowcase, PanicIntercept
    ui/             # Atomic UI components
  pages/
    LandingPage.jsx
    Onboard.jsx
    DashboardPage.jsx
    FirePage.jsx
    TaxPage.jsx
    PortfolioPage.jsx
```

## Dev Server

- Runs on port 5000 via `npm run dev`
- Host: 0.0.0.0, all hosts allowed (Replit proxy compatible)

## Deployment

- Static site deployment
- Build: `npm run build` → `dist/`
