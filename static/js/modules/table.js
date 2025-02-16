export function toggleView(view) {
    const graphContainer = document.querySelector('.visualization-container');
    const tableContainer = document.querySelector('.table-container');
    const graphButton = document.querySelector('.view-toggle button:first-child');
    const tableButton = document.querySelector('.view-toggle button:last-child');
    const graphOnlyButtons = document.querySelectorAll('.graph-only');
    const tableOnlyButtons = document.querySelectorAll('.table-only');
    if (view === 'table') {
        graphContainer.classList.add('hidden');
        tableContainer.classList.add('active');
        graphButton.classList.remove('active');
        tableButton.classList.add('active');
        graphOnlyButtons.forEach(btn => btn.classList.add('hidden'));
        tableOnlyButtons.forEach(btn => btn.classList.remove('hidden'));
        $('#lineageTable').bootstrapTable('refresh');
    } else {
        graphContainer.classList.remove('hidden');
        tableContainer.classList.remove('active');
        graphButton.classList.add('active');
        tableButton.classList.remove('active');
        graphOnlyButtons.forEach(btn => btn.classList.remove('hidden'));
        tableOnlyButtons.forEach(btn => btn.classList.add('hidden'));
    }
}

export function initTable() {
    $(document).ready(function() {
        try {
            function prepareTableData() {
                const tableData = [];
                const edgeMap = new Map();
                window.originalData.edges.forEach(edge => {
                    edgeMap.set(edge.target, edge);
                });
                window.originalData.nodes.forEach(node => {
                    if (node.type === 'column') {
                        const [tableName, columnName] = node.id.split('.');
                        const edge = edgeMap.get(node.id);
                        const row = {
                            tableName: tableName,
                            columnName: columnName,
                            sourceTable: '-',
                            sourceColumn: '-',
                            expression: '-'
                        };
                        if (edge) {
                            const [sourceTable, sourceColumn] = edge.source.split('.');
                            row.sourceTable = sourceTable;
                            row.sourceColumn = sourceColumn;
                            row.expression = edge.label || '-';
                        }
                        tableData.push(row);
                    }
                });
                return tableData;
            }
            const tableData = prepareTableData();
            $('#lineageTable').bootstrapTable('destroy').bootstrapTable({
                data: tableData,
                search: true,
                sortable: true,
                pagination: true,
                pageSize: 10,
                pageList: [10, 25, 50, 100],
                columns: [{
                    field: 'tableName',
                    title: 'Table Name',
                    sortable: true,
                    formatter: function(value) {
                        return value.toUpperCase();
                    }
                }, {
                    field: 'columnName',
                    title: 'Column Name',
                    sortable: true,
                    formatter: function(value) {
                        return value.toUpperCase();
                    }
                }, {
                    field: 'sourceTable',
                    title: 'Source Table',
                    sortable: true,
                    formatter: function(value) {
                        return value.toUpperCase();
                    }
                }, {
                    field: 'sourceColumn',
                    title: 'Source Column',
                    sortable: true,
                    formatter: function(value) {
                        return value.toUpperCase();
                    }
                }, {
                    field: 'expression',
                    title: 'Expression',
                    sortable: true,
                    formatter: function(value) {
                        return value.toUpperCase();
                    }
                }]
            });
        } catch (error) {
            console.error("Error initializing table:", error);
        }
    });
}
