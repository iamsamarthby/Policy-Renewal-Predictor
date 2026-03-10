"""
train.py — Train XGBoost churn prediction model on the CSV dataset.
Run: python train.py
"""
import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import roc_auc_score, classification_report
from xgboost import XGBClassifier

CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'insurance_policyholder_churn_synthetic.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'churn_model.pkl')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), 'model', 'encoders.pkl')

CATEGORICAL_COLS = ['policy_type', 'payment_frequency', 'marital_status', 'region_name', 'age_band']

FEATURE_COLS = [
    'age', 'customer_tenure_months', 'multi_policy_flag', 'num_policies',
    'current_premium', 'premium_last_year', 'premium_change_pct',
    'num_price_increases_last_3y', 'premium_to_coverage_ratio',
    'autopay_enabled', 'late_payment_count_12m', 'missed_payment_flag',
    'payment_method_change_flag', 'num_claims_12m', 'num_approved_claims_12m',
    'num_rejected_claims_12m', 'num_pending_claims_12m', 'avg_claim_amount',
    'total_claim_amount_12m', 'total_payout_amount_12m', 'payout_ratio_12m',
    'avg_settlement_time_days', 'days_since_last_claim',
    'num_contacts_12m', 'complaint_flag', 'complaint_resolution_days',
    'quote_requested_flag', 'coverage_downgrade_flag',
    # Encoded categoricals added dynamically below
]

def main():
    print('[train] Loading dataset...')
    df = pd.read_csv(CSV_PATH)
    print(f'[train] Loaded {len(df)} rows.')

    # Encode categoricals
    encoders = {}
    for col in CATEGORICAL_COLS:
        le = LabelEncoder()
        df[col + '_enc'] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    feature_cols = FEATURE_COLS + [c + '_enc' for c in CATEGORICAL_COLS]

    # Fill any nulls
    df[feature_cols] = df[feature_cols].fillna(0)

    X = df[feature_cols]
    y = df['churn_flag']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print('[train] Training XGBoost model...')
    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric='logloss',
        use_label_encoder=False,
        random_state=42,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=50)

    y_prob = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_prob)
    print(f'[train] Test AUC-ROC: {auc:.4f}')
    print(classification_report(y_test, model.predict(X_test)))

    # Save model + encoders
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump({'encoders': encoders, 'feature_cols': feature_cols}, ENCODER_PATH)
    print(f'[train] Model saved to {MODEL_PATH}')

if __name__ == '__main__':
    main()
