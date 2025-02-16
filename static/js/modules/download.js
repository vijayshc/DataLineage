export function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
export function downloadSVG(format) {
    const svg = document.querySelector("svg");
    const inner = svg.querySelector("g");
    const svgCopy = svg.cloneNode(true);
    const transform = inner.getAttribute("transform");
    svgCopy.querySelector("g").setAttribute("transform", transform);
    svgCopy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const styleSheet = document.createElement("style");
    const styles = Array.from(document.styleSheets)
        .filter(sheet => sheet.href === null || sheet.href.startsWith(window.location.origin))
        .map(sheet => Array.from(sheet.cssRules).map(rule => rule.cssText).join("\n"))
        .join("\n");
    styleSheet.textContent = styles;
    svgCopy.insertBefore(styleSheet, svgCopy.firstChild);
    const container = document.querySelector('.visualization-container');
    const { width: viewBoxWidth, height: viewBoxHeight } = container.getBoundingClientRect();
    svgCopy.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
    svgCopy.setAttribute("width", viewBoxWidth);
    svgCopy.setAttribute("height", viewBoxHeight);
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svgCopy);
    if (format === 'svg') {
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        downloadFile(url, 'lineage_diagram.svg');
        URL.revokeObjectURL(url);
    } else {
        const svgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            canvas.width = viewBoxWidth * 2;
            canvas.height = viewBoxHeight * 2;
            const ctx = canvas.getContext("2d");
            ctx.scale(2, 2);
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, viewBoxWidth, viewBoxHeight);
            ctx.drawImage(img, 0, 0, viewBoxWidth, viewBoxHeight);
            try {
                if (format === 'png') {
                    const pngUrl = canvas.toDataURL("image/png");
                    downloadFile(pngUrl, 'lineage_diagram.png');
                } else if (format === 'pdf') {
                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jspdf.jsPDF({
                        orientation: viewBoxWidth > viewBoxHeight ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [viewBoxWidth, viewBoxHeight]
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, viewBoxWidth, viewBoxHeight);
                    pdf.save("lineage_diagram.pdf");
                }
            } catch (error) {
                console.error('Error in conversion:', error);
                alert('Failed to convert diagram. Downloading as SVG instead.');
                downloadSVG('svg');
            }
        };
        img.onerror = function(error) {
            console.error('Error loading SVG:', error);
            alert('Failed to process diagram. Downloading as SVG instead.');
            downloadSVG('svg');
        };
        img.src = svgUrl;
    }
}
export function downloadTableExcel() {
    const tableData = $('#lineageTable').bootstrapTable('getData');
    const upperCaseData = tableData.map(row => ({
        tableName: row.tableName.toUpperCase(),
        columnName: row.columnName.toUpperCase(),
        sourceTable: row.sourceTable.toUpperCase(),
        sourceColumn: row.sourceColumn.toUpperCase(),
        expression: row.expression.toUpperCase()
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(upperCaseData);
    XLSX.utils.book_append_sheet(wb, ws, "Lineage Data");
    XLSX.writeFile(wb, "lineage_data.xlsx");
}

/* Optional initializer if additional setup is needed */
export function initDownloads() {
    /* ...existing code if any... */
}
