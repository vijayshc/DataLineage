let g, svg, inner, zoom, render;

export function initGraph(data, options = {}) {
    // Create graph structure
    g = new dagreD3.graphlib.Graph({compound: true})
        .setGraph({
            rankdir: 'LR',
            marginx: 20,
            marginy: 40,
            nodesep: 20,
            ranksep: 50,
            edgesep: 50,
            rankAlignment: 'UL',
            clusterPadding: 30,
            labelStyle: 'padding-top: 10px;'
        });
    data.nodes.forEach(node => {
        if (node.type === 'table') {
            g.setNode(node.id, {
                label: node.label,
                clusterLabel: node.label, // Add this property to force cluster title rendering
                class: `node ${node.type}`,
                rx: 5,
                ry: 5,
                padding: 15,
                paddingTop: 25,
                width: 300,
                height: 40,
                labelpos: 'top',
                clusterLabelPos: 'top',
                style: 'padding-top: 20px;'
            });
        } else {
            g.setNode(node.id, {
                label: node.label,
                class: `node ${node.type}`,
                rx: 5,
                ry: 5,
                padding: 10,
                width: 300,
                height: 30
            });
        }
        if (node.parent) g.setParent(node.id, node.parent);
    });
    data.edges.forEach(edge => {
        g.setEdge(edge.source, edge.target, {
            label: edge.label,
            curve: d3.curveBasis,
            arrowheadClass: 'arrowhead'
        });
    });
    
    // Select svg and inner group
    svg = d3.select("svg");
    inner = svg.select("g");
    
    // Setup zoom behavior and capture current transform if preserving view
    zoom = d3.zoom().on("zoom", e => inner.attr("transform", e.transform));
    svg.call(zoom);
    let currentTransform = d3.zoomIdentity;
    if (options.preserveView) {
        currentTransform = d3.zoomTransform(svg.node());
    }
    
    render = new dagreD3.render();
    render(inner, g);
    
    // Apply transform based on options
    if (options.preserveView) {
        svg.call(zoom.transform, currentTransform);
    } else {
        const initialScale = 0.75;
        const svgWidth = svg.node().getBoundingClientRect().width;
        const svgHeight = svg.node().getBoundingClientRect().height;
        const graphWidth = g.graph().width;
        const graphHeight = g.graph().height;
        const translateX = (svgWidth - graphWidth * initialScale) / 2;
        const translateY = (svgHeight - graphHeight * initialScale) / 2;
        svg.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(initialScale));
    }
}

export function getGraphElements() {
    return { g, svg, inner, zoom, render };
}

// ...existing code...
