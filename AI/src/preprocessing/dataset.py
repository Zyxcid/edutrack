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
    """Normalize, encode, or transform data."""
    X = data.drop('Exam_Score', axis=1)
    y = data['Exam_Score']
    
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
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    X_processed = preprocessor.fit_transform(X)
    y_processed = y.fillna(y.median()).values / 100.0
    
    os.makedirs('saved_model', exist_ok=True)
    joblib.dump(preprocessor, 'saved_model/preprocessor.pkl')
    
    X_train, X_temp, y_train, y_temp = train_test_split(X_processed, y_processed, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
    
    return (X_train, y_train), (X_val, y_val), (X_test, y_test)

def build_tf_dataset(features, labels, batch_size=32):
    """Build a tf.data.Dataset for efficient training."""
    dataset = tf.data.Dataset.from_tensor_slices((features, labels))
    dataset = dataset.shuffle(buffer_size=1024).batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return dataset
