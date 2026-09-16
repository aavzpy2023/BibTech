import { useState, useMemo, useCallback } from 'react';

export default function useReferenceDetails(article = null) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [drawerState, setDrawerState] = useState({
    isOpen: false,
    type: 'references',
    title: '',
    data: [],
  });
  const [hoverInfo, setHoverInfo] = useState(null);
  const [copiedText, setCopiedText] = useState(null);
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const openDrawer = useCallback(
    (type, data = null, title = '') => {
      let resolvedData = data;
      let resolvedTitle = title;

      if (!resolvedData && article) {
        if (type === 'authors') {
          resolvedData = article.authors_detail || [];
          resolvedTitle = resolvedTitle || 'Authors Details';
        } else if (type === 'references') {
          resolvedData = article.references_list || [];
          resolvedTitle = resolvedTitle || 'Cited References';
        } else if (type === 'funding') {
          const hasList =
            article.funding_list && article.funding_list.length > 0;
          resolvedData = hasList
            ? article.funding_list
            : article.funding_text
            ? [article.funding_text]
            : [];
          resolvedTitle = resolvedTitle || 'Funding Acknowledgments';
        } else if (type === 'abstract') {
          resolvedData = article.abstract ? [article.abstract] : [];
          resolvedTitle = resolvedTitle || 'Full Abstract';
        }
      }

      setDrawerState({
        isOpen: true,
        type: type || 'references',
        title: resolvedTitle || 'Details',
        data: resolvedData || [],
      });
    },
    [article]
  );

  const handleExpandDrawer = useCallback(
    (type, customData, customTitle) => {
      openDrawer(type, customData, customTitle);
    },
    [openDrawer]
  );

  const closeDrawer = useCallback(() => {
    setDrawerState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const handleHoverInfo = useCallback((key, event) => {
    if (!key) {
      setHoverInfo(null);
      return;
    }
    setHoverInfo({
      key,
      rect: event?.currentTarget?.getBoundingClientRect?.() || null,
    });
  }, []);

  const handleCopy = useCallback(async (text) => {
    if (!text) return;
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2500);
    } catch {
      // Fallback or silent error handling
    }
  }, []);

  const toggleAbstractExpanded = useCallback(() => {
    setIsAbstractExpanded((prev) => !prev);
  }, []);

  const formattedData = useMemo(() => {
    if (!article) {
      return {
        title: '',
        authors: '',
        year: '',
        journal: '',
        volume: '',
        issue: '',
        pages: '',
        doi: '',
        abstract: '',
        authorKeywords: [],
        plusKeywords: [],
        researchAreas: '',
        wosCategories: '',
        affiliations: '',
        authorsDetailsCount: 0,
        authorEmail: '',
        orcidCount: 0,
        researcherIdCount: 0,
        fundingText: '',
        type: 'Article',
        language: 'English',
        issn: '',
        month: '',
        articleNumber: '',
        publisher: '',
        address: '',
        timesCited: null,
        oaStatus: '',
        referencesList: [],
        authorsDetail: [],
        fundingList: [],
      };
    }

    const keywords = Array.isArray(article.keywords) ? article.keywords : [];
    const authorKeywords = keywords
      .filter((k) => k && k.type === 'author')
      .map((k) => k.name || k)
      .filter(Boolean);

    const plusKeywords = keywords
      .filter((k) => k && k.type === 'plus')
      .map((k) => k.name || k)
      .filter(Boolean);

    const authorsDetail = Array.isArray(article.authors_detail)
      ? article.authors_detail
      : [];

    const corrAuthor = authorsDetail.find(
      (a) => a && a.is_corresponding && a.email
    );
    const firstAuthorWithEmail = authorsDetail.find((a) => a && a.email);
    const authorEmail =
      corrAuthor?.email || firstAuthorWithEmail?.email || '';

    const orcidCount = authorsDetail.filter((a) => a && a.orcid).length;
    const researcherIdCount = authorsDetail.filter(
      (a) => a && a.researcher_id
    ).length;

    const affiliationsSet = new Set(
      authorsDetail.map((a) => a && a.affiliation).filter(Boolean)
    );
    const affiliations = Array.from(affiliationsSet).join('; ');

    return {
      title: article.title || '',
      authors: article.author || '',
      year: article.year ? String(article.year) : '',
      journal: article.journal || '',
      volume: article.volume ? String(article.volume) : '',
      issue: article.issue ? String(article.issue) : '',
      pages: article.pages || '',
      doi: article.doi || '',
      abstract: article.abstract || '',
      authorKeywords,
      plusKeywords,
      researchAreas: article.research_areas || '',
      wosCategories: article.web_of_science_categories || '',
      affiliations,
      authorsDetailsCount: authorsDetail.length,
      authorEmail,
      orcidCount,
      researcherIdCount,
      fundingText: article.funding_text || '',
      type: 'Article',
      language: article.language || 'English',
      issn: article.issn || '',
      month: article.month || '',
      articleNumber: article.pages || '',
      publisher: article.publisher || '',
      address: article.address || '',
      timesCited:
        typeof article.times_cited === 'number' ? article.times_cited : null,
      oaStatus: article.oa_status || '',
      referencesList: Array.isArray(article.references_list)
        ? article.references_list
        : [],
      authorsDetail,
      fundingList: Array.isArray(article.funding_list)
        ? article.funding_list
        : [],
    };
  }, [article]);

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
    drawerState,
    openDrawer,
    handleExpandDrawer,
    closeDrawer,
    hoverInfo,
    handleHoverInfo,
    copiedText,
    handleCopy,
    isAbstractExpanded,
    toggleAbstractExpanded,
    ...formattedData,
  };
}