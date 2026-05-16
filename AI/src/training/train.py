import tensorflow as tf
from src.custom.layers import CustomDenseBlock

def build_model(input_shape):
    """
    Build the architecture of the AI model using TF Functional API.
    Since this is a Regression task, the output layer has 1 node and linear activation.
    """
    inputs = tf.keras.Input(shape=input_shape)
    
    # Custom components usage
    x = CustomDenseBlock(64, activation='relu')(inputs)
    x = CustomDenseBlock(32, activation='relu')(x)
    
    # Final layer for Regression
    outputs = tf.keras.layers.Dense(1, activation='linear')(x)
    
    model = tf.keras.Model(inputs=inputs, outputs=outputs, name='Regression_Model')
    
    # Compile model with standard regression metrics
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae', 'mse']
    )
    return model

def train_model(model, train_data, val_data, epochs=10, callbacks=None):
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
