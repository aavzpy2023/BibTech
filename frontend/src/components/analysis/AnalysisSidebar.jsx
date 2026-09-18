import React from 'react';

export default function AnalysisSidebar({
    config,
    activeCategory,
    activeTab,
    onSelectCategory,
    onSelectTab
}) {
    const styles = {
        container: {
            width: '260px',
            borderRight: '1px solid #30363d',
            backgroundColor: '#0d1117',
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 0'
        },
        categoryButton: (isActive) => ({
            width: '100%',
            textAlign: 'left',
            padding: '10px 16px',
            backgroundColor: isActive ? '#1f2428' : 'transparent',
            color: isActive ? '#f0f6fc' : '#8b949e',
            border: 'none',
            fontWeight: isActive ? '600' : 'normal',
            cursor: 'pointer',
            fontSize: '14px',
            outline: 'none',
            transition: 'background-color 0.2s'
        }),
        tabList: {
            listStyle: 'none',
            padding: '0',
            margin: '4px 0 16px 0'
        },
        tabButton: (isActive) => ({
            width: '100%',
            textAlign: 'left',
            padding: '8px 16px 8px 32px',
            backgroundColor: isActive ? '#161b22' : 'transparent',
            color: isActive ? '#58a6ff' : '#8b949e',
            border: 'none',
            borderLeft: isActive ? '3px solid #58a6ff' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '13px',
            outline: 'none',
            transition: 'all 0.2s'
        })
    };

    return (
        <div style={styles.container} data-testid="analysis-sidebar">
            {config.map(category => (
                <div key={category.id}>
                    <button
                        style={styles.categoryButton(activeCategory === category.id)}
                        onClick={() => onSelectCategory(category.id)}
                        data-testid={`cat-${category.id}`}
                    >
                        {category.label}
                    </button>
                    
                    {activeCategory === category.id && (
                        <ul style={styles.tabList}>
                            {category.tabs.map(tab => (
                                <li key={tab.id}>
                                    <button
                                        style={styles.tabButton(activeTab === tab.id)}
                                        onClick={() => onSelectTab(tab.id)}
                                        data-testid={`tab-${tab.id}`}
                                    >
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
}