import os
import sys
import tensorflow as tf
import numpy as np
import time
import csv
from pathlib import Path

# Configure stdout to use UTF-8 encoding (prevents emoji crashes on Windows)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from src.preprocessing.dataset import load_data, preprocess_data, build_tf_dataset
from src.training.train import build_model, save_trained_model, accuracy

def main():
    print("=========================================================")
    print(" >>> STARTING CUSTOM TRAINING LOOP (tf.GradientTape) <<<")
    print("=========================================================\n")
    
    # 1. Load and preprocess data
    print("--- Loading and Preprocessing Data ---")
    data = load_data('../student_performance_dataset.csv')
    (X_train, y_train), (X_val, y_val), (X_test, y_test) = preprocess_data(data)
    
    print(f"Train shapes: {X_train.shape}, {y_train.shape}")
    print(f"Val shapes: {X_val.shape}, {y_val.shape}")
    print(f"Test shapes: {X_test.shape}, {y_test.shape}\n")
    
    batch_size = 32
    train_ds = build_tf_dataset(X_train, y_train, batch_size)
    val_ds = build_tf_dataset(X_val, y_val, batch_size)
    test_ds = build_tf_dataset(X_test, y_test, batch_size)
    
    # 2. Build model structure
    print("--- Building Model ---")
    input_shape = (X_train.shape[1],)
    model = build_model(input_shape)
    model.summary()
    
    # 3. Custom Training parameters
    epochs = 50  # Let's run a solid 50 epochs for demonstration
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.005)
    loss_fn = tf.keras.losses.MeanSquaredError()
    
    # Metrics
    train_mae_metric = tf.keras.metrics.MeanAbsoluteError()
    val_mae_metric = tf.keras.metrics.MeanAbsoluteError()
    test_mae_metric = tf.keras.metrics.MeanAbsoluteError()
    
    train_loss_metric = tf.keras.metrics.MeanSquaredError()
    val_loss_metric = tf.keras.metrics.MeanSquaredError()
    
    # Custom training step function
    @tf.function
    def train_step(x, y):
        with tf.GradientTape() as tape:
            # Forward pass
            predictions = model(x, training=True)
            loss_value = loss_fn(y, predictions)
            
        # Backward pass (calculate gradients)
        gradients = tape.gradient(loss_value, model.trainable_variables)
        # Apply gradients to update weights
        optimizer.apply_gradients(zip(gradients, model.trainable_variables))
        
        # Track metrics
        train_loss_metric.update_state(y, predictions)
        train_mae_metric.update_state(y, predictions)
        return loss_value

    # Custom validation step function
    @tf.function
    def val_step(x, y):
        val_preds = model(x, training=False)
        val_loss = loss_fn(y, val_preds)
        val_loss_metric.update_state(y, val_preds)
        val_mae_metric.update_state(y, val_preds)

    print("\n--- Starting tf.GradientTape Loop ---")
    best_val_mae = float('inf')
    best_weights = None
    
    # Prepare CSV logging for training epochs and later test results
    log_dir = Path(__file__).parent / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "training_log.csv"
    # Write header if file does not exist
    header = ["epoch","accuracy","learning_rate","loss","mae","mse","val_accuracy","val_loss","val_mae","val_mse","test_accuracy"]
    if not log_file.is_file():
        with open(log_file, "w", newline="") as f:
            csv.writer(f).writerow(header)
    
    for epoch in range(epochs):
        start_time = time.time()
        
        # Reset metrics at the start of each epoch
        train_loss_metric.reset_state()
        train_mae_metric.reset_state()
        val_loss_metric.reset_state()
        val_mae_metric.reset_state()
        
        # Iterating through training batches
        for step, (x_batch_train, y_batch_train) in enumerate(train_ds):
            train_step(x_batch_train, y_batch_train)
            
        # Iterating through validation batches
        for x_batch_val, y_batch_val in val_ds:
            val_step(x_batch_val, y_batch_val)
            
        epoch_time = time.time() - start_time
        
        # Get metrics results
        train_loss = train_loss_metric.result().numpy()
        train_mae = train_mae_metric.result().numpy()
        val_loss = val_loss_metric.result().numpy()
        val_mae = val_mae_metric.result().numpy()
        
        print(f"Epoch {epoch+1:02d}/{epochs:02d} [{epoch_time:.2f}s] -> "
              f"Loss: {train_loss:.5f} | MAE: {train_mae:.5f} || "
              f"Val Loss: {val_loss:.5f} | Val MAE: {val_mae:.5f}")
        
        # Append epoch metrics to CSV (train accuracy not tracked, placeholder empty)
        with open(log_file, "a", newline="") as f:
            csv.writer(f).writerow([epoch+1, "", "", train_loss, train_mae, "", "", val_loss, "", val_mae, ""])
        
        # Save best weights (similar to EarlyStopping's restore_best_weights)
        if val_mae < best_val_mae:
            best_val_mae = val_mae
            best_weights = model.get_weights()

    # Restore best weights before evaluation
    if best_weights is not None:
        print("\n[OK] Restoring best weights based on lowest Val MAE...")
        model.set_weights(best_weights)

    # 4. Custom Evaluation Loop on Test set
    print("\n--- Evaluating on Test Dataset ---")
    test_mae_metric.reset_state()
    test_predictions = []
    test_labels = []
    
    for x_batch_test, y_batch_test in test_ds:
        preds = model(x_batch_test, training=False)
        test_mae_metric.update_state(y_batch_test, preds)
        test_predictions.extend(preds.numpy().flatten())
        test_labels.extend(y_batch_test.numpy().flatten())
        
    final_test_mae = test_mae_metric.result().numpy()
    
    # Calculate custom accuracy metric
    y_true_tf = tf.constant(test_labels, dtype=tf.float32)
    y_pred_tf = tf.constant(test_predictions, dtype=tf.float32)
    final_acc = accuracy(y_true_tf, y_pred_tf).numpy()
    
    print(f"-> Final Test Evaluation - MAE: {final_test_mae:.5f} | Accuracy: {final_acc * 100:.2f}%")
    # Append test accuracy to CSV
    with open(log_file, "a", newline="") as f:
        csv.writer(f).writerow(["test", "", "", "", "", "", "", "", "", "", f"{final_acc:.5f}"])
        # Record which model was used (local or Vertex AI)
        use_vertex = bool(os.getenv("VERTEX_ENDPOINT_ID"))
        best_model_desc = "Vertex AI endpoint" if use_vertex else "Local TensorFlow model"
        csv.writer(f).writerow(["best_model", best_model_desc] + [""] * 9)

    # 5. Save the trained model
    print("\n--- Saving Custom Trained Model ---")
    save_trained_model(model, "saved_model/model.keras")
    print("🎉 Custom Training Loop Complete!")

if __name__ == "__main__":
    main()
