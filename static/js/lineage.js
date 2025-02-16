// Using ES6 modules to import functionality
import { initGraph } from './modules/graph.js';
import { attachEvents } from './modules/events.js';
import { initDownloads, downloadSVG, downloadTableExcel } from './modules/download.js';
import { initTable, toggleView } from './modules/table.js';
import { startRealtimeUpdates } from './modules/realtime.js';
// Removed import { setupSearch } from './modules/search.js';

let data = window.originalData;
/* Initialize graph, events, downloads, and table */
initGraph(data);
attachEvents();
initDownloads();
initTable();

// Expose functions globally for inline HTML event handlers
window.toggleView = toggleView;
window.downloadSVG = downloadSVG;
window.downloadTableExcel = downloadTableExcel;

// Define hideNonDependentColumns and showAllColumns globally
window.hideNonDependentColumns = function() {
    // Filter out column nodes not used in any edge, keep all non-column nodes
    let filteredNodes = window.originalData.nodes.filter(node => {
        if (node.type !== 'column') return true;
        const used = window.originalData.edges.some(e => e.source === node.id || e.target === node.id);
        return used;
    });
    
    // For each table node, ensure at least one child exists so that the cluster label is rendered.
    window.originalData.nodes.forEach(node => {
        if (node.type === 'table') {
            const hasChild = filteredNodes.some(child => child.parent === node.id);
            if (!hasChild) {
                filteredNodes.push({
                    id: node.id + '_dummy',
                    label: '',         // no visible label
                    type: 'dummy',     // type dummy so that styling doesn't interfere
                    parent: node.id
                });
            }
        }
    });
    
    const validIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = window.originalData.edges.filter(e => validIds.has(e.source) && validIds.has(e.target));
    initGraph({ nodes: filteredNodes, edges: filteredEdges });
};

window.showAllColumns = function() {
    initGraph(window.originalData);
};

// Initialize new features
//startRealtimeUpdates();
// Removed setupSearch();
