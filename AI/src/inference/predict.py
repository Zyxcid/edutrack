import tensorflow as tf
import pandas as pd
import joblib

def load_inference_components(model_path="saved_model/model.keras", preprocessor_path="saved_model/preprocessor.pkl"):
    """
    Load pre-trained model and scikit-learn preprocessor.
    """
    model = tf.keras.models.load_model(model_path)
    preprocessor = joblib.load(preprocessor_path)
    return model, preprocessor

def preprocess_input(input_dict, preprocessor):
    """
    Preprocess raw dict input into model-ready tensor.
    """
    df = pd.DataFrame([input_dict])
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
