import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os

def load_data(file_path):
    """Load dataset from file."""
    return pd.read_csv(file_path)

def clean_data(data):
    """Perform data cleaning operations here."""
    pass

def preprocess_data(data):
    """Normalize, encode, or transform data without data leakage."""
    X = data.drop('Academic_Readiness', axis=1)
    y = data['Academic_Readiness']
    
    # Split raw data first to avoid data leakage (Train-Test Contamination)
    # Ratio: 45% train, 45% val, 10% test (45/45/10 ratio as specified in CONTEXT.md)
    # Step 1: Split into Train (45%) and Temp (55%) -> test_size = 0.55
    # Step 2: Split Temp into Val (45% of total) and Test (10% of total) -> test_size = 10/55 (approx 18.18%)
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.55, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=(10/55), random_state=42)
    
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns
    categorical_features = X.select_dtypes(include=['object']).columns
    
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='Missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, list(numeric_features)),
            ('cat', categorical_transformer, list(categorical_features))
        ])

    # Fit and transform ONLY the training features to prevent leaking validation/test statistics
    X_train_processed = preprocessor.fit_transform(X_train)
    
    # Transform validation and test features using the FITTED preprocessor (no fitting on val/test!)
    X_val_processed = preprocessor.transform(X_val)
    X_test_processed = preprocessor.transform(X_test)
    
    # Fill missing target values using the median calculated ONLY from y_train
    y_train_median = y_train.median()
    y_train_processed = y_train.fillna(y_train_median).values
    y_val_processed = y_val.fillna(y_train_median).values
    y_test_processed = y_test.fillna(y_train_median).values
    
    os.makedirs('saved_model', exist_ok=True)
    joblib.dump(preprocessor, 'saved_model/preprocessor.pkl')
    
    return (X_train_processed, y_train_processed), (X_val_processed, y_val_processed), (X_test_processed, y_test_processed)

def build_tf_dataset(features, labels, batch_size=32):
    """Build a tf.data.Dataset for efficient training."""
    dataset = tf.data.Dataset.from_tensor_slices((features, labels))
    dataset = dataset.shuffle(buffer_size=1024).batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return dataset
