import pandas as pd
import numpy as np
from model_trainer import FraudDetectionModel
import traceback
import os

def test_training():
    try:
        print("Testing model training...")
        
        # Check if CSV exists
        csv_path = 'credit_card_fraud.csv'
        if not os.path.exists(csv_path):
            print(f"ERROR: {csv_path} not found!")
            return False
        
        print(f"✓ CSV file found: {csv_path}")
        
        # Load CSV
        print("Loading CSV file...")
        df = pd.read_csv(csv_path)
        print(f"✓ Loaded {len(df)} rows from CSV")
        
        # Check required columns
        required_columns = [
            'Transaction Amount',
            'Merchant Category Code (MCC)',
            'Transaction Response Code',
            'Card Type',
            'Transaction Source',
            'Fraud Flag or Label'
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            print(f"ERROR: Missing columns: {missing_columns}")
            print(f"Available columns: {list(df.columns)}")
            return False
        
        print("✓ All required columns found")
        
        # Check data types
        print("Checking data types...")
        print(df[required_columns].dtypes)
        
        # Check for missing values
        print("Checking for missing values...")
        missing_values = df[required_columns].isnull().sum()
        print(missing_values)
        
        # Check target distribution
        print("Checking target distribution...")
        fraud_dist = df['Fraud Flag or Label'].value_counts()
        print(fraud_dist)
        
        # Initialize model trainer
        print("Initializing model trainer...")
        model_trainer = FraudDetectionModel()
        
        # Train model
        print("Training model...")
        model, scaler, metrics = model_trainer.train_model(df)
        
        print("✓ Model training completed successfully!")
        print("Metrics:", metrics)
        
        # Test saving
        print("Testing model saving...")
        os.makedirs('models', exist_ok=True)
        import joblib
        joblib.dump(model, 'models/test_model.pkl')
        joblib.dump(scaler, 'models/test_scaler.pkl')
        print("✓ Model saved successfully!")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        print("Full traceback:")
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    success = test_training()
    if success:
        print("\n🎉 All tests passed! Training should work.")
    else:
        print("\n❌ Tests failed. Check the errors above.") 