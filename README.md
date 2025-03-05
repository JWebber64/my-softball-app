# Project Router Configuration

## Important Routing Guidelines

- The application uses React Router v6
- BrowserRouter is configured ONLY in `src/main.jsx`
- Never add another Router component (BrowserRouter, HashRouter, etc.) anywhere else
- All routing components must be nested under the main Router in `main.jsx`

## Common Issues

- Error: "You cannot render a <Router> inside another <Router>"
  - Cause: Multiple Router components in the application
  - Solution: Remove any additional Router components and keep only the one in `main.jsx`

## Routing Structure

```jsx
// src/main.jsx - Router configuration
<BrowserRouter>
  <App />
</BrowserRouter>

// src/App.jsx - Route definitions
<Routes>
  <Route path="/" element={<Home />} />
  ...
</Routes>
```