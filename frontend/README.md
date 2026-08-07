# Chisel Landing Page (React)

A component-based recreation of the Chisel landing page — hero, trust strip,
login panel, and a dashboard preview image.

## Run it
```
npm install
npm run dev
```

## Structure
```
src/
  assets/
    hero-construction.png   – hero background photo
    login-blueprint.png     – login panel background sketch
    dashboard-preview.png   – dashboard screenshot (replaces the old mock component)
  components/
    Navbar/
      Navbar.jsx
      styles/Navbar.css
    Hero/
      Hero.jsx               – dark hero, real photo fading into solid navy behind the text
      styles/Hero.css
    TrustBar/
      TrustBar.jsx            – placeholder strip (logos removed, dev-in-progress note)
      styles/TrustBar.css
    LoginPanel/
      LoginPanel.jsx          – login card over the blueprint sketch background
      styles/LoginPanel.css
    DashboardPreview/
      DashboardPreview.jsx    – single image (dashboard screenshot), styled as a card
      styles/DashboardPreview.css
```

Every component keeps its CSS in its own `styles/` subfolder next to its `.jsx` file.

## Swapping images later
Each image is imported at the top of its component file, e.g.
```jsx
import heroImage from '../../assets/hero-construction.png'
```
Replace the file in `src/assets/` (keep the same filename) or update the import
path to point at a new file.
