import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <main
      style={{
        maxWidth: 760,
        margin: '4rem auto',
        padding: '0 1.5rem',
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.6,
      }}
    >
      <h1>FeltForge</h1>
      <p>UI primitives for playing cards and poker interfaces.</p>
      <h2>Development workspace</h2>
      <p>
        Repository tooling is initialized. The component gallery is awaiting
        access to the locked Penpot design source.
      </p>
      <p>No card, chip, marker, or table visuals are implemented yet.</p>
      <a href="https://github.com/saeedet/feltforge">Project repository</a>
    </main>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Playground root is missing');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
