import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, confusion_matrix, classification_report
)
from features import extract_features_from_url, get_feature_names

print("Loading dataset...")
df = pd.read_csv("dataset/phishing_urls.csv")

print(f"Total rows: {len(df)}")
print(f"Columns: {df.columns.tolist()}")
print(f"Label distribution:\n{df['Label'].value_counts()}")

# Label encode: bad=1 (phishing), good=0 (legitimate)
df["label_encoded"] = df["Label"].apply(lambda x: 1 if str(x).strip().lower() == "bad" else 0)

print("\nExtracting features... (this may take a few minutes)")

feature_names = get_feature_names()
feature_rows = []

for i, url in enumerate(df["URL"]):
    if i % 2000 == 0:
        print(f"  Processing {i}/{len(df)}...")
    try:
        f = extract_features_from_url(str(url))
        feature_rows.append([f[name] for name in feature_names])
    except Exception:
        feature_rows.append([0] * len(feature_names))

X = np.array(feature_rows)
y = df["label_encoded"].values

print(f"\nFeature matrix shape: {X.shape}")

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")

# Train Random Forest
print("\nTraining Random Forest...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    random_state=42,
    n_jobs=-1  # use all CPU cores
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy  = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall    = recall_score(y_test, y_pred)
cm        = confusion_matrix(y_test, y_pred)

print("\n" + "="*50)
print("MODEL PERFORMANCE")
print("="*50)
print(f"Accuracy:  {accuracy:.4f}  ({accuracy*100:.2f}%)")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"\nConfusion Matrix:")
print(f"  TN: {cm[0][0]}  FP: {cm[0][1]}")
print(f"  FN: {cm[1][0]}  TP: {cm[1][1]}")
print("\nFull Report:")
print(classification_report(y_test, y_pred, target_names=["Legitimate", "Phishing"]))
print("="*50)

# Save model
model_path = "model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(model, f)

print(f"\nModel saved to: {model_path}")
print("Training complete!")