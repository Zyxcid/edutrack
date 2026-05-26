import os
import csv
import tensorflow as tf
from src.preprocessing.dataset import load_data, preprocess_data, build_tf_dataset
from src.training.train import build_model, train_model, save_trained_model
from src.training.evaluate import evaluate_model
from src.callbacks.callbacks import TrainingMonitorCallback

def main():
    print("--- Loading and Preprocessing Data ---")
    data = load_data('../student_performance_dataset.csv')
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
    os.makedirs('logs', exist_ok=True)
    csv_logger = tf.keras.callbacks.CSVLogger('logs/training_log.csv', append=False)
    custom_callback = TrainingMonitorCallback()
    early_stop = tf.keras.callbacks.EarlyStopping(monitor='val_mae', patience=30, restore_best_weights=True)
    lr_reducer = tf.keras.callbacks.ReduceLROnPlateau(monitor='val_mae', factor=0.5, patience=10, min_lr=1e-5)
    
    # TensorBoard logs directory
    tensorboard_cb = tf.keras.callbacks.TensorBoard(log_dir='logs/tensorboard', histogram_freq=1)
    
    history = train_model(model, train_ds, val_ds, epochs=300, callbacks=[custom_callback, early_stop, lr_reducer, csv_logger, tensorboard_cb])
    
    print("--- Evaluating Model ---")
    results = evaluate_model(model, test_ds)
    print(f"Test Evaluation Results [Loss, MAE, MSE, Accuracy]: {results}")
    
    # Append test results to CSV log
    log_path = os.path.join(os.path.dirname(__file__), "logs", "training_log.csv")
    with open(log_path, "a", newline="") as f:
        loss_str = f"{results[0]:.10f}"
        mae_str = f"{results[1]:.10f}"
        mse_str = f"{results[2]:.10f}"
        acc_str = f"{results[3]:.10f}"
        csv.writer(f).writerow(["test", "", "", loss_str, mae_str, mse_str, "", acc_str, "", "", ""])
        use_vertex = bool(os.getenv("VERTEX_ENDPOINT_ID"))
        best_model_desc = "Vertex AI endpoint" if use_vertex else "Local TensorFlow model"
        csv.writer(f).writerow(["best_model", best_model_desc, "", loss_str, mae_str, mse_str, "", acc_str, "", "", ""])
        print("--- Saving Model ---")
        save_trained_model(model, "saved_model/model.keras")
        save_trained_model(model, "saved_model/model.h5")

if __name__ == "__main__":
    main()
