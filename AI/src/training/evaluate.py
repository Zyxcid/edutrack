import tensorflow as tf

def evaluate_model(model, test_data):
    # Evaluate model capabilities on test dataset.
    results = model.evaluate(test_data)
    return results

def compute_metrics(y_true, y_pred):
    # Compute specific metrics like Accuracy, MAE, Precision, Recall, etc.
    pass
