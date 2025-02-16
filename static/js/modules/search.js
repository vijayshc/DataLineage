import { initGraph } from './graph.js';
import { attachEvents } from './events.js';

function getFilteredNodes(term) {
    // When search text is empty, return all nodes.
    if (!term.trim()) return window.originalData.nodes;
    
    // Initial filter based on label match
    const filteredIds = new Set(
        window.originalData.nodes
            .filter(node => node.label.toLowerCase().includes(term))
            .map(n => n.id)
    );
    // Recursively add dependents: if an edge originates from a node in filteredIds, add its target.
    let added;
    do {
        added = false;
        window.originalData.edges.forEach(edge => {
            if (filteredIds.has(edge.source) && !filteredIds.has(edge.target)) {
                filteredIds.add(edge.target);
                added = true;
            }
        });
    } while (added);
    // For table (cluster) nodes, only include them if:
    // - They directly match the search term, OR
    // - They have at least one child (column) node in the filtered results.
    const resultIds = new Set();
    window.originalData.nodes.forEach(node => {
        if (node.type !== 'table') {
            if (filteredIds.has(node.id)) resultIds.add(node.id);
        } else {
            // table node: include if itself matches OR any column with parent equals table id is present
            const hasChild = window.originalData.nodes.some(child => child.parent === node.id && filteredIds.has(child.id));
            if (filteredIds.has(node.id) || hasChild) resultIds.add(node.id);
        }
    });
    return window.originalData.nodes.filter(node => resultIds.has(node.id));
}

export function setupSearch() {
    const searchInput = document.getElementById('nodeSearch');
    if (!searchInput) return;
    searchInput.addEventListener('keyup', (event) => {
        const term = event.target.value.toLowerCase();
        const filteredNodes = getFilteredNodes(term);
        // Build filtered edges: keep edge if both endpoints exist in filtered nodes
        const validIds = new Set(filteredNodes.map(n => n.id));
        const filteredEdges = window.originalData.edges.filter(e =>
            validIds.has(e.source) && validIds.has(e.target)
        );
        if (!term.trim()) {
            // Empty search: reset view (default zoom)
            initGraph(window.originalData, { preserveView: false });
        } else {
            // Update graph with filtered data while preserving current view
            initGraph({ nodes: filteredNodes, edges: filteredEdges }, { preserveView: true });
        }
        attachEvents();
    });
}
