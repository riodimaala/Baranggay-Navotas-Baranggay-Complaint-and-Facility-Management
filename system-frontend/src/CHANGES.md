# v3.1

- Page transitions (curtain) and notifications now always play, even if Windows "Animation effects" is off
- Removed the scroll indicator on the landing page hero
- Removed the light/dark toggle (site follows the device theme again)

Changed files:
  src/components/RouteTransition.jsx
  src/components/portal/ToastProvider.jsx
  src/components/portal/PortalLayout.jsx
  src/components/site/Hero.jsx
  src/main.jsx
  src/premium3.css
Delete: src/hooks/useTheme.js
