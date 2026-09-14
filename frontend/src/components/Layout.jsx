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
  header: {
    borderBottom: '1px solid #e1e4e8',
    padding: '0 20px',
    backgroundColor: '#ffffff'
  },
  nav: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
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
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  }
};

function Layout() {
  return (
    <div>
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
    </div>
  );
}

export default Layout;