import { useState, useMemo, useCallback } from 'react';

function parseBibtexFields(raw) {
    if (!raw || typeof raw !== 'string') return {};
    const fields = {};
    const bodyStart = raw.indexOf(',');
    if (bodyStart === -1) return {};
    const body = raw.slice(bodyStart + 1);

    let i = 0;
    const n = body.length;
    while (i < n) {
        while (i < n && /[\s,]/.test(body[i])) i++;
        if (i >= n || body[i] === '}') break;

        const keyStart = i;
        while (i < n && body[i] !== '=' && body[i] !== '}' && !/\s/.test(body[i])) {
            i++;
        }
        const key = body.slice(keyStart, i).trim().toLowerCase();
        while (i < n && /[\s=]/.test(body[i])) i++;
        if (i >= n || body[i] === '}') break;

        let val = '';
        if (body[i] === '{') {
            i++;
            let depth = 1;
            const valStart = i;
            while (i < n && depth > 0) {
                if (body[i] === '{') depth++;
                else if (body[i] === '}') depth--;
                if (depth > 0) i++;
            }
            val = body.slice(valStart, i).trim();
            i++;
        } else if (body[i] === '"') {
            i++;
            const valStart = i;
            while (i < n && body[i] !== '"') {
                if (body[i] === '\\' && i + 1 < n) i++;
                i++;
            }
            val = body.slice(valStart, i).trim();
            i++;
        } else {
            const valStart = i;
            while (i < n && body[i] !== ',' && body[i] !== '}' && body[i] !== '\n') {
                i++;
            }
            val = body.slice(valStart, i).trim();
        }

        if (key && val) {
            fields[key] = val.replace(/\\_/g, '_').replace(/\s+/g, ' ');
        }
    }
    return fields;
}

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
        } else if (type === 'affiliations') {
          resolvedData = article.affiliations ? [article.affiliations] : [];
          resolvedTitle = resolvedTitle || 'Affiliations';
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

    const parsedBib = parseBibtexFields(article.raw_data || article.raw_bibtex || '');

    const keywords = Array.isArray(article.keywords) ? article.keywords : [];
    let authorKeywords = keywords
      .filter((k) => k && k.type === 'author')
      .map((k) => k.name || k)
      .filter(Boolean);

    let plusKeywords = keywords
      .filter((k) => k && k.type === 'plus')
      .map((k) => k.name || k)
      .filter(Boolean);

    if (authorKeywords.length === 0 && parsedBib['keywords']) {
        authorKeywords = parsedBib['keywords'].split(';').map((k) => k.trim()).filter(Boolean);
    }
    if (plusKeywords.length === 0 && parsedBib['keywords-plus']) {
        plusKeywords = parsedBib['keywords-plus'].split(';').map((k) => k.trim()).filter(Boolean);
    }

    const authorsDetail = Array.isArray(article.authors_detail)
      ? article.authors_detail
      : [];

    const corrAuthor = authorsDetail.find(
      (a) => a && a.is_corresponding && a.email
    );
    const firstAuthorWithEmail = authorsDetail.find((a) => a && a.email);
    let authorEmail =
      corrAuthor?.email || firstAuthorWithEmail?.email || parsedBib['author-email'] || '';

    let orcidCount = authorsDetail.filter((a) => a && a.orcid).length;
    if (orcidCount === 0 && parsedBib['orcid-numbers']) {
        orcidCount = parsedBib['orcid-numbers'].split('/').length - 1;
    }

    let researcherIdCount = authorsDetail.filter(
      (a) => a && a.researcher_id
    ).length;
    if (researcherIdCount === 0 && parsedBib['researcherid-numbers']) {
        researcherIdCount = parsedBib['researcherid-numbers'].split('/').length - 1;
    }

    const authorNames = authorsDetail.map((a) => a && a.name).filter(Boolean);
    authorNames.sort((a, b) => b.length - a.length);

    let rawAffils = authorsDetail
      .map((a) => a && a.affiliation)
      .filter((aff) => typeof aff === 'string' && aff.trim() !== '');

    if (rawAffils.length === 0) {
      const parsedBib = parseBibtexFields(article.raw_data || article.raw_bibtex || '');
      const rawAffil = parsedBib['affiliation'] || parsedBib['affiliations'] || '';
      if (rawAffil) {
        if (typeof rawAffil === 'string' && rawAffil.includes('=')) {
          const matched = rawAffil.match(/\[.*?\]\s*([^.]+)/g);
          rawAffils = matched ? matched : [rawAffil];
        } else {
          rawAffils = [rawAffil];
        }
      }
    }

    const affiliationsSet = new Set();

    rawAffils.forEach((raw) => {
      const parts = raw.split(';');
      parts.forEach((p) => {
        let clean = p.trim().replace(/^\[.*?\]\s*/, '').trim();

        let modified = true;
        while (modified && clean.length > 0) {
          modified = false;
          for (const authorName of authorNames) {
            const lClean = clean.toLowerCase();
            const lAuth = authorName.toLowerCase();
            if (lClean.startsWith(lAuth + ',') || lClean.startsWith(lAuth + ';')) {
              clean = clean.substring(authorName.length + 1).trim();
              modified = true;
              break;
            } else if (lClean === lAuth) {
              clean = '';
              modified = true;
              break;
            }
          }
        }

        if (clean) {
          const isPureAuthor =
            !/\d/.test(clean) &&
            (clean.match(/,/g) || []).length === 1 &&
            clean.length < 25 &&
            !/univ|inst|sch|sci|dept|lab|ctr|center|college|fac|inc|ltd|corp/i.test(clean);

          if (!isPureAuthor) affiliationsSet.add(clean);
        }
      });
    });

    let affiliations = Array.from(affiliationsSet).join('; ');

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