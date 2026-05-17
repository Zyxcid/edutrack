import tensorflow as tf
from src.custom.layers import CustomDenseBlock

def accuracy(y_true, y_pred):
    """
    Custom accuracy for regression.
    Since target is normalized to 0-1, MAE of 0.02 means 2% error.
    Accuracy = 1.0 - MAE
    """
    y_true = tf.cast(y_true, tf.float32)
    y_pred = tf.cast(y_pred, tf.float32)
    y_true = tf.reshape(y_true, tf.shape(y_pred))
    return 1.0 - tf.math.reduce_mean(tf.abs(y_true - y_pred))

def build_model(input_shape):
    """
    Build the architecture of the AI model using TF Functional API.
    Deep and wide architecture to catch any deterministic dataset formula for MAE <= 0.02
    """
    inputs = tf.keras.Input(shape=input_shape)
    
    x = CustomDenseBlock(256, activation='relu')(inputs)
    x = CustomDenseBlock(128, activation='relu')(x)
    x = CustomDenseBlock(64, activation='relu')(x)
    x = CustomDenseBlock(32, activation='relu')(x)
    x = tf.keras.layers.Dense(16, activation='relu')(x)
    
    outputs = tf.keras.layers.Dense(1, activation='linear')(x)
    
    model = tf.keras.Model(inputs=inputs, outputs=outputs, name='Regression_Model')
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.005),
        loss='mse',
        metrics=['mae', 'mse', accuracy]
    )
    return model

def train_model(model, train_data, val_data, epochs=300, callbacks=None):
    """
    Train the machine learning model.
    """
    history = model.fit(
        train_data,
        validation_data=val_data,
        epochs=epochs,
        callbacks=callbacks
    )
    return history

def save_trained_model(model, path="saved_model/model.keras"):
    """
    Export the model to the defined path.
    """
    model.save(path)
    print(f"Model saved to {path}")
