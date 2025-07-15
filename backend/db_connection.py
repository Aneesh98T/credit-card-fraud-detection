from pymongo import MongoClient

# Replace <username>, <password>, <dbname> with your actual values
uri = "mongodb+srv://anishtamakhu98:<db_password>@creditfraud.igftal4.mongodb.net/?retryWrites=true&w=majority&appName=creditfraud"

# Create a client
client = MongoClient(uri)

# Connect to a specific database
db = client['fraud_detection']

# Connect to a collection (like a table)
transactions_collection = db['transactions']

# Example insert
sample_data = {"transaction_id": "1234", "amount": 500, "is_fraud": False}
transactions_collection.insert_one(sample_data)
