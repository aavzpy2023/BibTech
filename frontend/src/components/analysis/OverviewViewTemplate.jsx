import React from 'react';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto'
    },
    header: {
        borderBottom: 'none',
        paddingBottom: '8px'
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#f0f6fc',
        margin: '0 0 8px 0'
    },
    subtitle: {
        fontSize: '14px',
        color: '#8b949e',
        margin: 0
    },
    content: {
        flex: 1
    }
};

export default function OverviewViewTemplate({
    title,
    subtitle,
    children
}) {
    return (
        <div style={styles.container} data-testid="overview-view-template">
            <div style={styles.header}>
                <h2 style={styles.title}>{title}</h2>
                {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
            </div>
            <div style={styles.content}>
                {children}
            </div>
        </div>
    );
}