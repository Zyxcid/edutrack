import os
import tensorflow as tf
from src.preprocessing.dataset import load_data, preprocess_data, build_tf_dataset
from src.training.train import build_model, train_model, save_trained_model
from src.training.evaluate import evaluate_model
from src.callbacks.callbacks import TrainingMonitorCallback

def main():
    print("--- Loading and Preprocessing Data ---")
    data = load_data('data/raw/dataset.csv')
    (X_train, y_train), (X_val, y_val), (X_test, y_test) = preprocess_data(data)
    
    print(f"Train shapes: {X_train.shape}, {y_train.shape}")
    
    batch_size = 32
    train_ds = build_tf_dataset(X_train, y_train, batch_size)
    val_ds = build_tf_dataset(X_val, y_val, batch_size)
    test_ds = build_tf_dataset(X_test, y_test, batch_size)
    
    print("--- Building Model ---")
    input_shape = (X_train.shape[1],)
    model = build_model(input_shape)
    model.summary()
    
    print("--- Training Model ---")
    custom_callback = TrainingMonitorCallback()
    early_stop = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)
    
    history = train_model(model, train_ds, val_ds, epochs=10, callbacks=[custom_callback, early_stop])
    
    print("--- Evaluating Model ---")
    results = evaluate_model(model, test_ds)
    print(f"Test Evaluation Results [Loss, MAE, MSE]: {results}")
    
    print("--- Saving Model ---")
    save_trained_model(model, "saved_model/model.keras")

if __name__ == "__main__":
    main()
