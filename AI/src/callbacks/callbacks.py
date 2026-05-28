import tensorflow as tf

class TrainingMonitorCallback(tf.keras.callbacks.Callback):
    # Custom Component: A callback to monitor training on each epoch's end.
    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        val_loss = logs.get('val_loss', 0.0)
        print(f"\n[Custom Monitor] Epoch {epoch+1} finished. Current Val Loss: {val_loss:.4f}")
