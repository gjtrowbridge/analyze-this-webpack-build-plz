import './index.css';

import { createRoot } from 'react-dom/client'
import { App } from "./components/App"

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

/**
 * TODO:
 *
 * - Finish comparison logic
 * - Add DB for modules and chunks
 * - Test it out more
 */

// Render your React component instead
const root = createRoot(document.getElementById('app'))
root.render(
  <App />
)
