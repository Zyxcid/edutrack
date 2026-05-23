import tensorflow as tf
import pandas as pd
import joblib

def load_inference_components(model_path="saved_model/model.keras", preprocessor_path="saved_model/preprocessor.pkl"):
    """
    Load pre-trained model and scikit-learn preprocessor.
    """
    model = tf.keras.models.load_model(model_path, compile=False)
    preprocessor = joblib.load(preprocessor_path)
    return model, preprocessor


def _normalize_text(value):
    if pd.isna(value):
        return None
    return str(value).strip().title()


def _map_with_default(value, mapping, default=0):
    if pd.isna(value):
        return default
    return mapping.get(_normalize_text(value), default)


def derive_performance_category(row):
    score = float(row.get('Previous_Scores', 0) or 0)
    attendance = float(row.get('Attendance', 0) or 0)

    if score >= 85 and attendance >= 85:
        return 'High'
    if score >= 65 or attendance >= 70:
        return 'Medium'
    return 'Low'


def add_derived_features(df):
    """
    Add derived features required by the saved preprocessor.
    """
    df = df.copy()

    df['Study_Efficiency'] = (
        df['Hours_Studied'].fillna(0).astype(float)
        / df['Sleep_Hours'].replace({0: 1}).fillna(1).astype(float)
    )

    df['Sleep_Study_Ratio'] = (
        df['Sleep_Hours'].fillna(0).astype(float)
        / df['Hours_Studied'].replace({0: 1}).fillna(1).astype(float)
    )

    engagement_mapping = {
        'Yes': 1,
        'No': 0,
        'Positive': 1,
        'Neutral': 0.5,
        'Negative': 0,
        'High': 1,
        'Medium': 0.75,
        'Low': 0.5,
    }
    df['Engagement_Score'] = (
        df['Extracurricular_Activities'].apply(lambda v: _map_with_default(v, {'Yes': 1, 'No': 0}, 0))
        + df['Peer_Influence'].apply(lambda v: _map_with_default(v, {'Positive': 1, 'Neutral': 0.5, 'Negative': 0}, 0))
        + df['Motivation_Level'].apply(lambda v: _map_with_default(v, {'High': 1, 'Medium': 0.75, 'Low': 0.5}, 0))
        + df['Physical_Activity'].fillna(0).astype(float).clip(lower=0)
    )

    support_mapping = {
        'Low': 0,
        'Medium': 1,
        'High': 2,
    }
    df['Support_Score'] = (
        df['Parental_Involvement'].apply(lambda v: _map_with_default(v, support_mapping, 1))
        + df['Teacher_Quality'].apply(lambda v: _map_with_default(v, support_mapping, 1))
        + df['Access_to_Resources'].apply(lambda v: _map_with_default(v, support_mapping, 1))
        + df['Family_Income'].apply(lambda v: _map_with_default(v, support_mapping, 1))
    )

    df['Performance_Category'] = df.apply(derive_performance_category, axis=1)

    return df


def preprocess_input(input_dict, preprocessor):
    """
    Preprocess raw dict input into model-ready tensor.
    """
    df = pd.DataFrame([input_dict])
    df = add_derived_features(df)
    
    # Map raw string features to their numeric encodings since the preprocessor expects them as numeric features
    mappings = {
        'Parental_Involvement': {'Low': 0, 'Medium': 1, 'High': 2},
        'Access_to_Resources': {'Low': 0, 'Medium': 1, 'High': 2},
        'Extracurricular_Activities': {'No': 0, 'Yes': 1},
        'Motivation_Level': {'Low': 0, 'Medium': 1, 'High': 2},
        'Internet_Access': {'No': 0, 'Yes': 1},
        'Family_Income': {'Low': 0, 'Medium': 1, 'High': 2},
        'Teacher_Quality': {'Low': 0, 'Medium': 1, 'High': 2},
        'School_Type': {'Public': 0, 'Private': 1},
        'Peer_Influence': {'Negative': 0, 'Neutral': 1, 'Positive': 2},
        'Learning_Disabilities': {'No': 0, 'Yes': 1},
        'Parental_Education_Level': {'High School': 0, 'College': 1, 'Postgraduate': 2},
        'Distance_from_Home': {'Near': 0, 'Moderate': 1, 'Far': 2},
        'Gender': {'Male': 0, 'Female': 1}
    }
    
    for col, mapping in mappings.items():
        if col in df.columns:
            df[col] = df[col].apply(lambda v: _map_with_default(v, mapping, 0))
            
    processed_array = preprocessor.transform(df)
    return processed_array


def predict(model, processed_input):
    """
    Perform a prediction and return human-readable score.
    """
    predictions = model.predict(processed_input, verbose=0)
    # Re-scale back to real score (since we divided by 100 during training)
    final_score = predictions[0][0] * 100.0
    return float(final_score)
