"""
predict.py — Load model and predict churn for a given customer dict.
"""
import os
import numpy as np
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'churn_model.pkl')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), 'model', 'encoders.pkl')

CATEGORICAL_COLS = ['policy_type', 'payment_frequency', 'marital_status', 'region_name', 'age_band']

_model = None
_meta = None

def _load():
    global _model, _meta
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _meta = joblib.load(ENCODER_PATH)

def predict_customer(customer: dict) -> dict:
    """
    Given a flat customer dict (from CSV), return churn_probability and churn_flag.
    """
    _load()
    encoders = _meta['encoders']
    feature_cols = _meta['feature_cols']

    row = {}
    for col in feature_cols:
        if col.endswith('_enc'):
            base = col[:-4]
            val = str(customer.get(base, ''))
            le = encoders[base]
            try:
                row[col] = le.transform([val])[0]
            except Exception:
                row[col] = 0
        else:
            try:
                row[col] = float(customer.get(col, 0) or 0)
            except Exception:
                row[col] = 0.0

    X = np.array([[row[c] for c in feature_cols]])
    prob = float(_model.predict_proba(X)[0][1])
    flag = int(prob >= 0.5)
    return {'churn_probability': prob, 'churn_flag': flag}
