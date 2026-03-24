import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0f; --surface: #13131a; --surface2: #1c1c26; --border: #2a2a38;
  --accent: #6c63ff; --red: #ff4d6d; --green: #43e97b; --yellow: #f7c948;
  --blue: #4fc3f7; --text: #e8e8f0; --text2: #8888aa; --text3: #55556a;
}
body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; -webkit-font-smoothing: antialiased; }
#root { min-height: 100vh; display: flex; flex-direction: column; }
button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
input, select, textarea { font-family: 'DM Sans', sans-serif; }
a { text-decoration: none; color: inherit; }
::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--surface); } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
`;
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
