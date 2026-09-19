export const EXTENDED_PALETTE = [
    '#ff1a2e', '#1a5cff', '#00c853', '#00b8d4', '#ff9800', 
    '#9c27b0', '#ffeb3b', '#e91e63', '#795548', '#cddc39', 
    '#673ab7', '#009688', '#ff5722', '#607d8b', '#8bc34a'
];

export const CLUSTER_METADATA = {
    1: { name: 'Primary Collaboration Cluster', color: EXTENDED_PALETTE[0] },
    2: { name: 'Core Scientific Cluster', color: EXTENDED_PALETTE[1] },
    3: { name: 'Emerging Research Cluster', color: EXTENDED_PALETTE[2] },
    4: { name: 'Secondary Hub', color: EXTENDED_PALETTE[3] }
};

/**
 * Returns the hex color for a given node cluster group.
 */
export const getNodeColor = (group) => {
    const strGroup = String(group);
    if (top4GroupsCache.size > 0 && !top4GroupsCache.has(strGroup)) {
        return '#c9c9c9'; // Others
    }

    const cluster = CLUSTER_METADATA[group];
    if (cluster) return cluster.color;
    
    const numericGroup = parseInt(group, 10);
    if (!isNaN(numericGroup)) {
        const safeIndex = Math.max(0, numericGroup - 1);
        return EXTENDED_PALETTE[safeIndex % EXTENDED_PALETTE.length];
    }
    return '#9ca3af';
};

// Rango de radios general (en px de grafo, antes de aplicar `scale`).
// Reducido respecto a la versión anterior (antes tope 30) para que la red
// se vea menos "pesada" en general.
export const RADIUS_RANGE = { min: 3, max: 13 };

const getMetric = (node) =>
node.degree !== undefined ? node.degree : (node.citations || node.papers || 1);

/**
 * Normaliza el radio de cada nodo en dos pasos:
 *
 * 1. Variación LOCAL: dentro de su propio grupo/color, el nodo más conectado
 *    se ve más grande que el menos conectado de ESE MISMO grupo.
 * 2. Techo GLOBAL: el tamaño máximo que puede alcanzar un grupo depende de
 *    qué tan conectado está su nodo más importante frente al nodo más
 *    conectado de TODA la red. Así, un clúster aislado y pequeño (ej. 4
 *    autores en Vietnam) nunca compite en tamaño con los hubs del clúster
 *    principal — pero sigue teniendo variación interna entre sus propios
 *    nodos.
 *
 * Sin el paso 2, cada color llenaría el mismo rango de tamaños sin importar
 * su importancia real, y un clúster de 3 personas se vería tan "grande" como
 * el clúster de colaboración primario — perdiendo esa jerarquía visual.
 *
 * Debe llamarse una vez, después de calcular `node.degree`, y antes de usar
 * `calculateRadius` para el layout (separación de islas, colisiones, etc.).
 * Guarda el resultado en `node.radius`.
 */
let top4GroupsCache = new Set();

export const assignNodeRadii = (nodes) => {
    const globalMax = Math.max(...nodes.map(getMetric), 1);

    const counts = new Map();
    nodes.forEach(n => counts.set(n.group, (counts.get(n.group) || 0) + 1));
    const sortedGroups = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    top4GroupsCache = new Set(sortedGroups.slice(0, 4).map(e => String(e[0])));

    const byGroup = new Map();
    nodes.forEach(n => {
        const list = byGroup.get(n.group) || [];
        list.push(n);
        byGroup.set(n.group, list);
    });

    byGroup.forEach(list => {
        const metrics = list.map(getMetric);
        const groupMin = Math.min(...metrics);
        const groupMax = Math.max(...metrics);

        // Techo del grupo: proporcional a qué tan conectado está su nodo más
        // importante frente al máximo global (nunca por debajo de RADIUS_RANGE.min).
        const groupCeiling = RADIUS_RANGE.min +
        (RADIUS_RANGE.max - RADIUS_RANGE.min) * (groupMax / globalMax);

        list.forEach(n => {
            const metric = getMetric(n);
            // Si todos los nodos del grupo tienen el mismo grado (o el grupo
            // tiene un solo nodo), no hay variación interna que mostrar: van
            // directo al techo de su grupo.
            const t = groupMax > groupMin ? (metric - groupMin) / (groupMax - groupMin) : 1;
            n.radius = RADIUS_RANGE.min + t * (groupCeiling - RADIUS_RANGE.min);
        });
    });
};

/**
 * Calcula el radio final de un nodo. Usa `node.radius` (calculado por
 * `assignNodeRadii`) si ya está disponible; si no, cae a una fórmula
 * genérica por si algún nodo llega sin pasar por ese paso.
 */
export const calculateRadius = (node, scale = 1) => {
    if (!node) return RADIUS_RANGE.min * scale;
    if (node.radius !== undefined) return node.radius * scale;
    const value = Math.max(0, getMetric(node));
    return Math.min(RADIUS_RANGE.max, RADIUS_RANGE.min + Math.sqrt(value) * 1.4) * scale;
};
