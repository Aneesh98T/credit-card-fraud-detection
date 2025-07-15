import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.utils.class_weight import compute_class_weight
import xgboost as xgb
from imblearn.over_sampling import SMOTE
import warnings
warnings.filterwarnings('ignore')

class FraudDetectionModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = None
        self.feature_columns = None

    def preprocess_data(self, df):
        data = df.copy()
        # Select relevant columns
        feature_cols = [
            'Transaction Amount',
            'Merchant Category Code (MCC)',
            'Transaction Response Code',
            'Card Type',
            'Transaction Source'
        ]
        # Only keep the columns we need + target
        if 'Fraud Flag or Label' in data.columns:
            feature_cols_with_target = feature_cols + ['Fraud Flag or Label']
            data = data[feature_cols_with_target]
        else:
            data = data[feature_cols]

        # Fill missing values
        data = data.fillna(0)

        # Encode categorical columns
        for col in ['Card Type', 'Transaction Source']:
            if col in data.columns:
                data[col] = pd.Categorical(data[col]).codes

        # Set feature columns for later use
        self.feature_columns = [col for col in data.columns if col != 'Fraud Flag or Label']

        return data

    def train_model(self, df):
        """Train the fraud detection model"""
        # Preprocess data
        data = self.preprocess_data(df)

        # Separate features and target
        X = data[self.feature_columns]
        y = data['Fraud Flag or Label']

        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Scale the features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Handle class imbalance using SMOTE
        smote = SMOTE(random_state=42)
        # Ensure y_train is a 1D numpy array for SMOTE
        y_train_array = np.array(y_train)
        smote_result = smote.fit_resample(X_train_scaled, y_train_array)
        if len(smote_result) == 2:
            X_train_balanced, y_train_balanced = smote_result
        else:
            X_train_balanced, y_train_balanced = smote_result[0], smote_result[1]

        # Train multiple models and select the best one
        models = {
            'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
            'XGBoost': xgb.XGBClassifier(random_state=42),
            'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000)
        }

        best_score = 0
        best_model = None

        for name, model in models.items():
            # Calculate class weights for imbalanced data
            class_weights = compute_class_weight(
                'balanced', classes=np.unique(y_train_balanced), y=y_train_balanced
            )
            weight_dict = dict(zip(np.unique(y_train_balanced), class_weights))

            if hasattr(model, 'class_weight'):
                model.class_weight = weight_dict

            # Train the model
            model.fit(X_train_balanced, y_train_balanced)

            # Predict on test set
            y_pred = model.predict(X_test_scaled)

            # Calculate F1 score (good for imbalanced data)
            f1 = f1_score(y_test, y_pred)

            if f1 > best_score:
                best_score = f1
                best_model = model

        if best_model is None:
            best_model = list(models.values())[0]

        self.model = best_model

        # Calculate final metrics
        y_pred_final = best_model.predict(X_test_scaled)

        metrics = {
            'accuracy': float(accuracy_score(y_test, y_pred_final)),
            'precision': float(precision_score(y_test, y_pred_final)),
            'recall': float(recall_score(y_test, y_pred_final)),
            'f1_score': float(f1_score(y_test, y_pred_final)),
            'fraud_rate': float(np.mean(y_test)),
            'total_samples': len(y_test),
            'fraud_samples': int(np.sum(y_test))
        }

        return best_model, self.scaler, metrics

    def predict_fraud(self, transactions_df, model, scaler):
        """Predict fraud for new transactions"""
        # Preprocess the transactions
        data = self.preprocess_data(transactions_df)

        # Select features
        X = data[self.feature_columns]

        # Scale features
        X_scaled = scaler.transform(X)

        # Make predictions
        predictions = model.predict(X_scaled)

        return predictions

    def get_feature_importance(self, model):
        """Get feature importance from the trained model"""
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importance = np.abs(model.coef_[0])
        else:
            return None

        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': importance
        }).sort_values('importance', ascending=False)

        return feature_importance 