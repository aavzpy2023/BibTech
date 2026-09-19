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
        paddingBottom: '4px'
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
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '6px',
        padding: '12px 16px',
        gap: '16px',
        flexWrap: 'wrap'
    },
    mainCard: {
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
    },
    footerDrawer: {
        marginTop: '12px',
        padding: '12px 16px',
        backgroundColor: '#21262d',
        borderRadius: '6px',
        border: '1px solid #30363d',
        width: '100%',
        boxSizing: 'border-box',
        color: '#f0f6fc',
        fontSize: '13px'
    }
};

export default function AnalysisPageTemplate({
    title,
    subtitle,
    toolbar,
    children,
    footer,
    dataTestId = 'analysis-page-template'
}) {
    return (
        <div style={styles.container} data-testid={dataTestId}>
            <div style={styles.header}>
                <h2 style={styles.title}>{title}</h2>
                {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
            </div>

            {toolbar && (
                <div style={styles.toolbar} data-testid="analysis-toolbar">
                    {toolbar}
                </div>
            )}

            <div style={styles.mainCard} data-testid="analysis-main-card">
                {children}
                {footer && (
                    <div
                        style={styles.footerDrawer}
                        data-testid="analysis-footer"
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}