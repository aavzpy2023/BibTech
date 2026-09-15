import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BatchProvider } from '../hooks/useBatchLoad';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Search', path: '/search' },
  { name: 'Load', path: '/load' },
  { name: 'Download queue', path: '/queue' },
  { name: 'Analysis', path: '/analysis' },
  { name: 'References', path: '/references' }
];

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#0d1117',
    color: '#f0f6fc'
  },
  header: {
    flexShrink: 0,
    borderBottom: 'none',
    padding: '0 16px',
    backgroundColor: '#161b22'
  },
  nav: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: {
    padding: '12px 4px',
    textDecoration: 'none',
    color: '#8b949e',
    fontWeight: 500,
    fontSize: '14px',
    borderBottom: '2px solid transparent'
  },
  activeLink: {
    color: '#58a6ff',
    borderBottom: '2px solid #58a6ff'
  },
  main: {
    flex: 1,
    width: '100%',
    padding: '8px 16px',
    overflowY: 'auto',
    backgroundColor: '#0d1117',
    boxSizing: 'border-box'
  },
  footer: {
    flexShrink: 0,
    padding: '6px 16px',
    textAlign: 'center',
    borderTop: 'none',
    backgroundColor: '#161b22',
    color: '#586069',
    fontSize: '14px'
  }
};

function Layout() {
  const currentYear = new Date().getFullYear();
  return (
    <div style={styles.container}>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
          background-color: #0d1117;
          color: #f0f6fc;
        }
        h1, h2, h3, h4, label {
          color: #f0f6fc !important;
        }
        input, textarea, select {
          background-color: #0d1117 !important;
          color: #f0f6fc !important;
          border-color: #30363d !important;
        }
        table, th, td {
          border-color: #30363d !important;
        }
        th {
          background-color: #161b22 !important;
          color: #f0f6fc !important;
        }
        tr {
          background-color: #0d1117 !important;
          color: #f0f6fc !important;
        }
      `}</style>
      <header style={styles.header}>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.activeLink : {})
              })}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </header>
      <main style={styles.main}>
        <BatchProvider>
          <Outlet />
        </BatchProvider>
      </main>
      <footer style={styles.footer}>
        &copy; {currentYear} Universidad Tecnológica Metropolitana, Santiago, Chile
      </footer>
    </div>
  );
}

export default Layout;