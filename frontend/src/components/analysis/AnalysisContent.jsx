import React from 'react';
import OverviewViewTemplate from './OverviewViewTemplate';

const OVERVIEW_METADATA = {
    'general-kpis': {
        title: 'General KPIs',
        subtitle: 'Overall performance metrics and summary indicators.'
    },
    'publication-citation-evolution': {
        title: 'Publication & Citation Evolution',
        subtitle: 'Historical trajectory of publications and citation impact.'
    },
    'journal-distribution': {
        title: 'Journal Distribution',
        subtitle:
            'Breakdown and dispersion of articles across publication sources.'
    },
    'research-snapshot': {
        title: 'Research Snapshot',
        subtitle:
            'Consolidated scientometric snapshot of the current collection.'
    },
    'key-insights': {
        title: 'Key Insights',
        subtitle:
            'Automated analysis findings and primary bibliographic takeaways.'
    }
};

export default function AnalysisContent({ activeTabId }) {
    const styles = {
        container: {
            flex: 1,
            backgroundColor: '#0d1117',
            color: '#c9d1d9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            minHeight: '100%',
            flexDirection: 'column'
        },
        placeholderCard: {
            padding: '48px',
            backgroundColor: '#161b22',
            border: '1px dashed #30363d',
            borderRadius: '8px',
            textAlign: 'center'
        },
        title: {
            margin: '0 0 16px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#f0f6fc'
        },
        subtitle: {
            margin: 0,
            fontSize: '14px',
            color: '#8b949e'
        }
    };

    const overviewConfig = OVERVIEW_METADATA[activeTabId];

    if (overviewConfig) {
        return (
            <OverviewViewTemplate
                title={overviewConfig.title}
                subtitle={overviewConfig.subtitle}
            >
                <div style={styles.placeholderCard}>
                    <p style={styles.subtitle}>
                        Visualizations and metrics for {overviewConfig.title} will
                        appear here.
                    </p>
                </div>
            </OverviewViewTemplate>
        );
    }

    return (
        <div style={styles.container} data-testid="analysis-content">
            <div style={styles.placeholderCard}>
                <h2 style={styles.title}>Placeholder for {activeTabId}</h2>
                <p style={styles.subtitle}>
                    Future dynamic visualization component will be rendered here.
                </p>
            </div>
        </div>
    );
}