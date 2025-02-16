import { getGraphElements } from './graph.js';

export function attachEvents() {
    const { svg, inner, g } = getGraphElements();
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function findDependencies(nodeId) {
        const deps = new Set();
        const visited = new Set();
        const edges = g.edges();
        function traverse(id) {
            if (visited.has(id)) return;
            visited.add(id);
            edges.forEach(e => {
                if (e.v === id && !visited.has(e.w)) {
                    deps.add(e.w);
                    traverse(e.w);
                }
                if (e.w === id && !visited.has(e.v)) {
                    deps.add(e.v);
                    traverse(e.v);
                }
            });
        }
        traverse(nodeId);
        return deps;
    }
    function resetHighlights() {
        inner.selectAll('.highlighted, .dependent')
             .classed('highlighted', false)
             .classed('dependent', false);
    }
    inner.selectAll("g.node")
        .attr("id", nodeId => nodeId)
        .on("mouseover", (event, id) => {
            const node = window.originalData.nodes.find(n => n.id === id);
            if (node) {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`
                    <div class="card border-0">
                        <div class="card-body p-2">
                            <h6 class="card-title mb-2">${node.label}</h6>
                            <p class="card-text mb-1">Type: ${node.type}</p>
                            ${node.type === 'table' ? `<p class="card-text mb-0">Columns: ${node.columns?.length || 0}</p>` : ''}
                        </div>
                    </div>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .on("click", (event, nodeId) => {
            event.stopPropagation();
            resetHighlights();
            const deps = findDependencies(nodeId);
            deps.forEach(dep => {
                inner.selectAll(`g.node[id="${dep}"]`)
                     .classed("dependent", true)
                     .style("opacity", 0.8)
                     .transition().duration(300).style("opacity", 1);
            });
            inner.selectAll(`g.node[id="${nodeId}"]`).classed("highlighted", true);
        });
    svg.on('click', () => {
        resetHighlights();
    });
}
