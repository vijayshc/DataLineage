from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

# Sample lineage data
lineage_data = {
    "Orders": {
        "order_id": {"source_table": None, "source_column": None},
        "customer_id": {"source_table": "Customers", "source_column": "customer_id"},
        "order_date": {"source_table": None, "source_column": None},
        "total_amount": {"source_table": "Order_Items", "source_column": "item_price", "aggregation": "SUBSTR(COLUMN,1,2)"},
        "shipping_address": [{"source_table": "Customers", "source_column": "address"},{"source_table": "Customers", "source_column": "registration_datedfdfdfdfd"}],
        "product_id": {"source_table": "Products", "source_column": "product_id"},
    },
    "Customers": {
        "customer_id": {"source_table": None, "source_column": None},
        "customer_name": {"source_table": None, "source_column": None},
        "address": {"source_table": None, "source_column": None},
        "registration_datedfdfdfdfd": {"source_table": None, "source_column": None},

    },
    "Order_Items": {
        "item_id": {"source_table": None, "source_column": None},
        "order_id": {"source_table": None, "source_column": None},
        "product_id": {"source_table": "Products", "source_column": "product_id"},
        "item_price": {"source_table": "Products", "source_column": "price"},
        "quantity": {"source_table": None, "source_column": None},
        "product_id": {"source_table": "Products", "source_column": "product_id"},
    },
    "Products": {
        "product_id": {"source_table": None, "source_column": None},
        "product_name": {"source_table": None, "source_column": None},
        "price": {"source_table": None, "source_column": None},
        "category": {"source_table": None, "source_column": None},
    }
}

def prepare_graph_data():
    nodes = []
    edges = []
    
    # Create nodes for tables and columns
    for table, columns in lineage_data.items():
        table_id = table
        nodes.append({
            "id": table_id,
            "label": table,
            "type": "table",
            "columns": list(columns.keys()),
            "labelLength": len(table)
        })
        
        # Add column nodes
        for column, details in columns.items():
            column_id = f"{table}.{column}"
            nodes.append({
                "id": column_id,
                "label": column,
                "type": "column",
                "parent": table_id,
                "labelLength": len(column)
            })
            
            # Add edges for column relationships supporting multiple sources
            # If details is a list then iterate through each dictionary item
            if isinstance(details, list):
                for detail in details:
                    if detail.get("source_table") and detail.get("source_column"):
                        edges.append({
                            "source": f"{detail['source_table']}.{detail['source_column']}",
                            "target": column_id,
                            "label": detail.get("aggregation", "")
                        })
            else:
                if details.get("source_table") and details.get("source_column"):
                    if isinstance(details["source_table"], list) and isinstance(details["source_column"], list):
                        for src_table, src_column in zip(details["source_table"], details["source_column"]):
                            edges.append({
                                "source": f"{src_table}.{src_column}",
                                "target": column_id,
                                "label": details.get("aggregation", "")
                            })
                    else:
                        edges.append({
                            "source": f"{details['source_table']}.{details['source_column']}",
                            "target": column_id,
                            "label": details.get("aggregation", "")
                        })

    return {"nodes": nodes, "edges": edges}

@app.route('/')
def index():
    graph_data = prepare_graph_data()
    return render_template('lineage.html', data=json.dumps(graph_data))

@app.route('/data')
def data_endpoint():
    # In a real application, implement logic here to return updated lineage data.
    graph_data = prepare_graph_data()
    return jsonify(graph_data)

if __name__ == '__main__':
    app.run(debug=True, port=5001)