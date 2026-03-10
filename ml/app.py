"""
app.py — Flask ML microservice for the Policy Renewal Predictor.
Run: python app.py  (default port 5000)
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict_customer
import chromadb

app = Flask(__name__)
CORS(app)

CHROMA_PATH = os.path.join(os.path.dirname(__file__), '..', 'chroma_data')
chroma_client = None
try:
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
except Exception as e:
    print(f"[ML Service] Could not initialize ChromaDB locally: {e}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'policy-renewal-ml'})

@app.route('/predict', methods=['POST'])
def predict():
    """
    Body: { "customer": { ...all customer fields from CSV... } }
    Returns: { "churn_probability": float, "churn_flag": int }
    """
    data = request.get_json()
    if not data or 'customer' not in data:
        return jsonify({'error': 'Missing customer data'}), 400
    try:
        result = predict_customer(data['customer'])
        return jsonify(result)
    except FileNotFoundError:
        return jsonify({'error': 'Model not found. Run python train.py first.'}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/similar/<customer_id>', methods=['GET'])
def similar_customers(customer_id):
    """
    Query the local ChromaDB for similar customers.
    """
    if not chroma_client:
        return jsonify({'error': 'ChromaDB not initialized'}), 503
        
    try:
        collection = chroma_client.get_collection('customers')
        n_results = int(request.args.get('n', 3))
        
        # Use the built-in python client which automatically generates empty embeddings
        # or uses the default embedding function to map query_texts.
        results = collection.query(
            query_texts=[f"customer_{customer_id}"],
            n_results=n_results,
            include=['documents', 'metadatas']
        )
        
        docs = results.get('documents', [[]])[0]
        metas = results.get('metadatas', [[]])[0]
        
        similar_list = []
        for i in range(len(docs)):
            similar_list.append({
                'id': metas[i].get('customer_id') if hasattr(metas[i], 'get') else None,
                'description': docs[i]
            })
            
        return jsonify(similar_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Body: { "customers": [ {...}, {...}, ... ] }
    Returns: list of predictions
    """
    data = request.get_json()
    if not data or 'customers' not in data:
        return jsonify({'error': 'Missing customers list'}), 400
    try:
        results = [
            {'customer_id': c.get('customer_id'), **predict_customer(c)}
            for c in data['customers']
        ]
        return jsonify(results)
    except FileNotFoundError:
        return jsonify({'error': 'Model not found. Run python train.py first.'}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'[ML Service] Starting on http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, debug=False)
