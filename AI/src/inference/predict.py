import tensorflow as tf
import numpy as np

def load_saved_model(path="saved_model/model.keras"):
    """
    Load a pre-trained model for inference.
    """
    return tf.keras.models.load_model(path)

def preprocess_input(raw_input):
    """
    Preprocess user/API raw input into model-ready tensor.
    """
    pass

def predict(model, processed_input):
    """
    Perform a prediction and return formatted output.
    """
    predictions = model.predict(processed_input)
    return predictions
