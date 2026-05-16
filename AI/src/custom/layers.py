import tensorflow as tf

class CustomDenseBlock(tf.keras.layers.Layer):
    """
    Custom Component: A reusable Dense block with Batch Normalization.
    """
    def __init__(self, units, activation='relu', **kwargs):
        super(CustomDenseBlock, self).__init__(**kwargs)
        self.dense = tf.keras.layers.Dense(units, activation=activation)
        self.bn = tf.keras.layers.BatchNormalization()
        
    def call(self, inputs, training=False):
        x = self.dense(inputs)
        return self.bn(x, training=training)
