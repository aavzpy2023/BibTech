import React from 'react';
import AnalysisSidebar from '../components/analysis/AnalysisSidebar';
import AnalysisContent from '../components/analysis/AnalysisContent';
import useAnalysisNavigation from '../hooks/useAnalysisNavigation';
import { ANALYSIS_MENU_CONFIG } from '../config/analysisMenuConfig';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#0d1117'
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
  }
};

export function AnalysisView() {
  const {
    activeCategory,
    activeTab,
    setActiveCategory,
    setActiveTab
  } = useAnalysisNavigation();

  return (
    <div style={styles.container} data-testid="analysis-view">
      <AnalysisSidebar
        config={ANALYSIS_MENU_CONFIG}
        activeCategory={activeCategory}
        activeTab={activeTab}
        onSelectCategory={setActiveCategory}
        onSelectTab={setActiveTab}
      />
      <AnalysisContent activeTabId={activeTab} />
    </div>
  );
}

export default AnalysisView;