import pandas as pd
import numpy as np

# Load the dataset
df = pd.read_csv('credit_card_fraud.csv')

print("Dataset Info:")
print("=" * 50)
print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print(f"Data types:\n{df.dtypes}")
print(f"Missing values:\n{df.isnull().sum()}")
print(f"Sample data (first 5 rows):")
print(df.head())
print(f"\nTarget variable distribution:")
if 'fraud' in df.columns:
    print(df['fraud'].value_counts())
elif 'is_fraud' in df.columns:
    print(df['is_fraud'].value_counts())
elif 'Class' in df.columns:
    print(df['Class'].value_counts())
else:
    print("No obvious fraud column found. Available columns:", df.columns.tolist())

print(f"\nNumeric columns summary:")
print(df.describe()) 