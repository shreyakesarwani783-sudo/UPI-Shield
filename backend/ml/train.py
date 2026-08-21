import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, f1_score, confusion_matrix, classification_report
)
from xgboost import XGBClassifier
from features import extract_features_from_url, get_feature_names

# ============================================================
# STEP 1: Load and merge both datasets
# ============================================================
print("Loading datasets...")

df1 = pd.read_csv("dataset/phishing_urls.csv")
df1 = df1.rename(columns={"URL": "url", "Label": "raw_label"})
df1["label_encoded"] = df1["raw_label"].apply(lambda x: 1 if str(x).strip().lower() == "bad" else 0)
df1 = df1[["url", "label_encoded"]]

df2 = pd.read_csv("dataset/malicious_phish.csv")
df2 = df2.rename(columns={"type": "raw_label"})
# phishing, malware, defacement -> malicious (1) | benign -> safe (0)
df2["label_encoded"] = df2["raw_label"].apply(lambda x: 0 if str(x).strip().lower() == "benign" else 1)
df2 = df2[["url", "label_encoded"]]

print(f"Dataset 1 (original): {len(df1)} rows")
print(f"Dataset 2 (kaggle malicious): {len(df2)} rows")

df = pd.concat([df1, df2], ignore_index=True)
df = df.dropna(subset=["url"])
df["url"] = df["url"].astype(str).str.strip()
df = df.drop_duplicates(subset=["url"])

print(f"\nCombined dataset (after dedup): {len(df)} rows")
print(f"Label distribution:\n{df['label_encoded'].value_counts()}")
print(f"Class balance: {df['label_encoded'].value_counts(normalize=True) * 100}")

# ============================================================
# STEP 2: Extract features
# ============================================================
print("\nExtracting features... (this will take a while for a dataset this size)")

feature_names = get_feature_names()
feature_rows = []
urls = df["url"].tolist()

for i, url in enumerate(urls):
    if i % 20000 == 0:
        print(f"  Processing {i}/{len(urls)}...")
    try:
        f = extract_features_from_url(str(url))
        feature_rows.append([f[name] for name in feature_names])
    except Exception:
        feature_rows.append([0] * len(feature_names))

X = np.array(feature_rows)
y = df["label_encoded"].values

print(f"\nFeature matrix shape: {X.shape}")

# ============================================================
# STEP 3: Train/test split
# ============================================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")

# ============================================================
# STEP 4: Tune Random Forest
# ============================================================
print("\n" + "="*50)
print("TUNING RANDOM FOREST")
print("="*50)

rf_param_dist = {
    "n_estimators": [150, 200, 300, 400],
    "max_depth": [15, 20, 25, 30, None],
    "min_samples_split": [2, 5, 10],
    "min_samples_leaf": [1, 2, 4],
}

rf_search = RandomizedSearchCV(
    RandomForestClassifier(class_weight="balanced", random_state=42, n_jobs=1),
    param_distributions=rf_param_dist,
    n_iter=12,
    cv=3,
    scoring="f1",
    n_jobs=1,
    random_state=42,
    verbose=1
)
rf_search.fit(X_train, y_train)
rf_model = rf_search.best_estimator_
print(f"Best RF params: {rf_search.best_params_}")

# ============================================================
# STEP 5: Train XGBoost
# ============================================================
print("\n" + "="*50)
print("TRAINING XGBOOST")
print("="*50)

neg, pos = np.bincount(y_train)
scale_pos_weight = neg / pos

xgb_model = XGBClassifier(
    n_estimators=400,
    max_depth=8,
    learning_rate=0.08,
    subsample=0.9,
    colsample_bytree=0.9,
    scale_pos_weight=scale_pos_weight,
    eval_metric="logloss",
    random_state=42,
    n_jobs=1
)
xgb_model.fit(X_train, y_train)

# ============================================================
# STEP 6: Evaluate both, pick the winner
# ============================================================
def evaluate(model, name):
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    print(f"\n{'='*50}")
    print(f"{name} PERFORMANCE")
    print(f"{'='*50}")
    print(f"Accuracy:  {acc:.4f}  ({acc*100:.2f}%)")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"\nConfusion Matrix:")
    print(f"  TN: {cm[0][0]}  FP: {cm[0][1]}")
    print(f"  FN: {cm[1][0]}  TP: {cm[1][1]}")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Malicious"]))

    return {"model": model, "accuracy": acc, "precision": prec, "recall": rec, "f1": f1}

rf_results = evaluate(rf_model, "RANDOM FOREST")
xgb_results = evaluate(xgb_model, "XGBOOST")

# Pick the better model by accuracy
if xgb_results["accuracy"] >= rf_results["accuracy"]:
    winner = xgb_results
    winner_name = "XGBoost"
else:
    winner = rf_results
    winner_name = "Random Forest"

print("\n" + "="*50)
print(f"WINNER: {winner_name}")
print(f"Final Accuracy: {winner['accuracy']*100:.2f}%")
print(f"Final Precision: {winner['precision']:.4f}")
print(f"Final Recall: {winner['recall']:.4f}")
print(f"Final F1: {winner['f1']:.4f}")
print("="*50)

# ============================================================
# STEP 7: Save the winning model
# ============================================================
model_path = "model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(winner["model"], f)

print(f"\nModel saved to: {model_path}")
print(f"Dataset size used: {len(df)}")
print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")
print("Training complete!")