"""
embed.py — Generate customer text embeddings and store them in ChromaDB.
Run AFTER train.py and AFTER ChromaDB is running:
    python embed.py
"""
import os
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer

CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'insurance_policyholder_churn_synthetic.csv')
CHROMA_PATH = os.path.join(os.path.dirname(__file__), '..', 'chroma_data')
COLLECTION_NAME = 'customers'
BATCH_SIZE = 500

def customer_to_text(row):
    return (
        f"Customer {row['customer_id']}: age {row['age']}, {row['policy_type']} policy, "
        f"{row['customer_tenure_months']} months tenure, region {row['region_name']}, "
        f"premium change {float(row['premium_change_pct'])*100:.1f}%, "
        f"claims {row['num_claims_12m']}, complaints {row['complaint_flag']}, "
        f"late payments {row['late_payment_count_12m']}, "
        f"churn type: {row['churn_type']}, churn prob: {row['churn_probability_true']:.3f}"
    )

def main():
    print('[embed] Loading CSV...')
    df = pd.read_csv(CSV_PATH)
    # Only embed high-risk customers for efficiency
    df_risk = df[df['churn_probability_true'] >= 0.5].copy()
    print(f'[embed] Embedding {len(df_risk)} high-risk customers...')

    model = SentenceTransformer('all-MiniLM-L6-v2')
    client = chromadb.PersistentClient(path=CHROMA_PATH)

    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
    collection = client.create_collection(COLLECTION_NAME)

    texts = [customer_to_text(row) for _, row in df_risk.iterrows()]
    ids = [str(row['customer_id']) for _, row in df_risk.iterrows()]
    metadatas = [{'customer_id': str(row['customer_id']), 'churn_type': str(row['churn_type'])} for _, row in df_risk.iterrows()]

    for i in range(0, len(texts), BATCH_SIZE):
        batch_texts = texts[i:i+BATCH_SIZE]
        batch_ids = ids[i:i+BATCH_SIZE]
        batch_metas = metadatas[i:i+BATCH_SIZE]
        embeddings = model.encode(batch_texts).tolist()
        collection.add(embeddings=embeddings, documents=batch_texts, ids=batch_ids, metadatas=batch_metas)
        print(f'[embed] Stored {min(i+BATCH_SIZE, len(texts))}/{len(texts)} embeddings...')

    print('[embed] Done. ChromaDB populated.')

if __name__ == '__main__':
    main()
