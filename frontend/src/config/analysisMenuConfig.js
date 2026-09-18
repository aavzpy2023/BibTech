export const ANALYSIS_MENU_CONFIG = [
    {
        id: 'overview',
        label: 'Main Information',
        tabs: [
            { id: 'main-information', label: 'Main Information' },
            { id: 'dataset-metrics', label: 'Dataset Metrics' },
            { id: 'annual-production', label: 'Annual Scientific Production' },
            { id: 'average-citations', label: 'Average Citations per Year' },
            { id: 'three-fields-plot', label: 'Three Fields Plot' }
        ]
    },
    {
        id: 'sources',
        label: 'Sources',
        tabs: [
            { id: 'most-relevant-sources', label: 'Most Relevant Sources' },
            { id: 'most-cited-sources', label: 'Most Local Cited Sources' },
            { id: 'bradford-law', label: "Bradford's Law" },
            { id: 'sources-impact', label: 'Source Local Impact' },
            { id: 'sources-dynamics', label: 'Source Dynamics' }
        ]
    },
    {
        id: 'authors',
        label: 'Authors',
        tabs: [
            { id: 'most-relevant-authors', label: 'Most Relevant Authors' },
            { id: 'authors-production', label: 'Authors Production over Time' },
            { id: 'lotka-law', label: "Lotka's Law" },
            { id: 'authors-impact', label: 'Author Local Impact' },
            { id: 'relevant-affiliations', label: 'Most Relevant Affiliations' }
        ]
    },
    {
        id: 'documents',
        label: 'Documents',
        tabs: [
            { id: 'most-cited-global', label: 'Most Global Cited Documents' },
            { id: 'most-cited-local', label: 'Most Local Cited Documents' },
            { id: 'reference-spectroscopy', label: 'Reference Year Spectroscopy' },
            { id: 'most-frequent-words', label: 'Most Frequent Words' },
            { id: 'word-cloud', label: 'Word Cloud' }
        ]
    },
    {
        id: 'clustering',
        label: 'Clustering',
        tabs: [
            { id: 'coupling-network', label: 'Coupling Network' },
            { id: 'co-citation-network', label: 'Co-citation Network' },
            { id: 'co-authorship', label: 'Co-authorship Network' }
        ]
    },
    {
        id: 'conceptual',
        label: 'Conceptual Structure',
        tabs: [
            { id: 'co-occurrence-network', label: 'Co-occurrence Network' },
            { id: 'thematic-map', label: 'Thematic Map' },
            { id: 'thematic-evolution', label: 'Thematic Evolution' },
            { id: 'factorial-analysis', label: 'Factorial Analysis' }
        ]
    }
];