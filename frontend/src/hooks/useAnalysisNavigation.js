import { useState, useCallback } from 'react';
import { ANALYSIS_MENU_CONFIG } from '../config/analysisMenuConfig';

const STORAGE_KEY_TAB = 'novascope_analysis_active_tab';

const findCategoryForTab = (tabId) => {
    return ANALYSIS_MENU_CONFIG.find(cat => cat.tabs.some(t => t.id === tabId));
};

const getInitialState = () => {
    try {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const urlTab = urlParams.get('tab');
            if (urlTab) {
                const cat = findCategoryForTab(urlTab);
                if (cat) return { catId: cat.id, tabId: urlTab };
            }

            const savedTab = localStorage.getItem(STORAGE_KEY_TAB);
            if (savedTab) {
                const cat = findCategoryForTab(savedTab);
                if (cat) return { catId: cat.id, tabId: savedTab };
            }
        }
    } catch {
        // Fallback gracefully if storage or window is unavailable
    }

    const defaultCat = ANALYSIS_MENU_CONFIG[0];
    return { catId: defaultCat.id, tabId: defaultCat.tabs[0].id };
};

const persistTab = (tabId) => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_TAB, tabId);
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabId);
            window.history.replaceState({}, '', url.toString());
        }
    } catch {
        // Fallback gracefully
    }
};

export default function useAnalysisNavigation() {
    const [activeCategory, setActiveCategoryState] = useState(
        () => getInitialState().catId
    );
    const [activeTab, setActiveTabState] = useState(
        () => getInitialState().tabId
    );

    const setActiveCategory = useCallback((categoryId) => {
        setActiveCategoryState(categoryId);
        const category = ANALYSIS_MENU_CONFIG.find(c => c.id === categoryId);
        
        if (category && category.tabs.length > 0) {
            const alreadyInCat = category.tabs.some(t => t.id === activeTab);
            if (!alreadyInCat) {
                const firstTab = category.tabs[0].id;
                setActiveTabState(firstTab);
                persistTab(firstTab);
            }
        }
    }, [activeTab]);

    const setActiveTab = useCallback((tabId) => {
        const cat = findCategoryForTab(tabId);
        if (cat) {
            setActiveCategoryState(cat.id);
            setActiveTabState(tabId);
            persistTab(tabId);
        }
    }, []);

    return {
        activeCategory,
        activeTab,
        setActiveCategory,
        setActiveTab
    };
}