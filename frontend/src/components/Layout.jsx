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
    overflow: 'hidden'
  },
  header: {
    flexShrink: 0,
    borderBottom: '1px solid #e1e4e8',
    padding: '0 20px',
    backgroundColor: '#ffffff'
  },
  nav: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: {
    padding: '16px 4px',
    textDecoration: 'none',
    color: '#586069',
    fontWeight: 500,
    fontSize: '14px',
    borderBottom: '2px solid transparent'
  },
  activeLink: {
    color: '#0366d6',
    borderBottom: '2px solid #0366d6'
  },
  main: {
    flex: 1,
    width: '100%',
    padding: '20px 24px',
    overflowY: 'auto',
    boxSizing: 'border-box'
  },
  footer: {
    flexShrink: 0,
    padding: '10px 20px',
    textAlign: 'center',
    borderTop: '1px solid #e1e4e8',
    backgroundColor: '#ffffff',
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