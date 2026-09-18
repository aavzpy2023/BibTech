import { useState, useCallback } from 'react';
import { ANALYSIS_MENU_CONFIG } from '../config/analysisMenuConfig';

export default function useAnalysisNavigation() {
    const defaultCategory = ANALYSIS_MENU_CONFIG[0];
    const defaultTab = defaultCategory.tabs[0];

    const [activeCategory, setActiveCategoryState] = useState(defaultCategory.id);
    const [activeTab, setActiveTab] = useState(defaultTab.id);

    const setActiveCategory = useCallback((categoryId) => {
        setActiveCategoryState(categoryId);
        const category = ANALYSIS_MENU_CONFIG.find(c => c.id === categoryId);
        
        if (category && category.tabs.length > 0) {
            setActiveTab(category.tabs[0].id);
        }
    }, []);

    return {
        activeCategory,
        activeTab,
        setActiveCategory,
        setActiveTab
    };
}