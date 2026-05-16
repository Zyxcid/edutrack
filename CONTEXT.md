# AI Engineer Workflow Context

## Project Overview
Dokumen ini berisi workflow dan alur kerja untuk divisi AI Engineer dalam pengembangan project machine learning/deep learning. Workflow dibuat agar pengerjaan dapat dimulai walaupun dataset dari tim Data Science belum final.

---

# Role AI Engineer

AI Engineer bertanggung jawab untuk:
- Mendesain arsitektur model AI
- Mengimplementasikan model TensorFlow
- Membuat pipeline training
- Membuat sistem inference
- Menyimpan dan deploy model
- Integrasi model ke backend/API
- Monitoring dan evaluasi model

---

# Tech Stack

## Core AI
- Python
- TensorFlow / Keras
- NumPy
- Pandas

## Optional / Supporting
- FastAPI / Flask
- TensorBoard
- Matplotlib
- Scikit-learn

---

# Workflow Development

## Phase 1 — Project Initialization

### Objective
Menyiapkan struktur project dan environment development.

### Tasks
- Membuat repository project
- Setup virtual environment
- Install dependency
- Menentukan struktur folder
- Membuat branch development

### Folder Structure

```bash
project/
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── sample/
│
├── models/
│
├── notebooks/
│
├── src/
│   ├── preprocessing/
│   ├── training/
│   ├── inference/
│   ├── api/
│   ├── callbacks/
│   ├── custom/
│   └── utils/
│
├── saved_model/
├── logs/
├── requirements.txt
└── README.md
```

---

## Phase 2 — Problem Understanding

### Objective
Memahami permasalahan bisnis dan menentukan jenis model AI.

### Tasks
- Diskusi dengan tim Data Science
- Menentukan target prediksi
- Menentukan jenis machine learning:
  - Classification
  - Regression
  - NLP
  - Computer Vision
- Menentukan metrik evaluasi

### Example

#### Classification
- Output:
  - kelas emosi
  - kategori objek
  - klasifikasi penyakit

#### Regression
- Output:
  - prediksi nilai
  - prediksi harga
  - prediksi performa

---

## Phase 3 — AI Pipeline Preparation

### Objective
Mempersiapkan pipeline training sebelum dataset final tersedia.

### Tasks
- Membuat template preprocessing
- Membuat template training
- Membuat template evaluation
- Membuat template save model
- Membuat template inference

---

## Phase 4 — Model Architecture Development

### Objective
Membangun model menggunakan TensorFlow Functional API atau Model Subclassing.

### Tasks
- Mendesain arsitektur model
- Menentukan layer
- Menentukan activation function
- Menentukan optimizer
- Menentukan loss function

### Example Workflow

```python
def build_model():
    pass

def preprocess_data():
    pass

def train_model():
    pass

def evaluate_model():
    pass

def save_model():
    pass
```

---

## Phase 5 — Custom Component Development

### Objective
Mengimplementasikan minimal satu custom component sesuai checklist project.

### Available Options

#### Custom Layer

```python
class CustomLayer(tf.keras.layers.Layer):
    pass
```

#### Custom Loss Function

```python
def custom_loss(y_true, y_pred):
    pass
```

#### Custom Callback

```python
class CustomCallback(tf.keras.callbacks.Callback):
    pass
```

---

## Phase 6 — Dataset Integration

### Objective
Menghubungkan pipeline dengan dataset final dari tim Data Science.

### Tasks
- Load dataset
- Data cleaning
- Data preprocessing
- Data normalization
- Data splitting:
  - train
  - validation
  - test

### Collaboration With Data Science

AI Engineer menerima:
- dataset final
- hasil preprocessing awal
- feature engineering
- label definition

---

## Phase 7 — Model Training

### Objective
Melatih model menggunakan dataset final.

### Tasks
- Training model
- Hyperparameter tuning
- Monitoring training
- Early stopping
- Checkpoint saving

### Monitoring
- Accuracy
- Loss
- MAE
- Precision
- Recall

---

## Phase 8 — Evaluation

### Objective
Memastikan model memenuhi target performa.

### Minimum Requirement
- Accuracy ≥ 85%
- MAE ≤ 0.02

### Tasks
- Testing model
- Error analysis
- Validation analysis
- Confusion matrix
- Performance reporting

---

## Phase 9 — Model Export

### Objective
Menyimpan model ke format production-ready.

### Format
- `.keras`
- `SavedModel`

### Example

```python
model.save("saved_model/model.keras")
```

---

## Phase 10 — Inference Development

### Objective
Membuat sistem prediksi sederhana.

### Tasks
- Load model
- Input preprocessing
- Prediction
- Output formatting

### Example

```python
model = tf.keras.models.load_model("saved_model/model.keras")

prediction = model.predict(input_data)
```

---

## Phase 11 — API Integration (Optional)

### Objective
Menyediakan endpoint untuk frontend/backend.

### Framework Options
- FastAPI
- Flask

### Example Endpoints
- `/predict`
- `/health`
- `/model-info`

---

## Phase 12 — TensorBoard Monitoring (Optional)

### Objective
Visualisasi training model.

### Tasks
- Logging metrics
- Visualisasi accuracy/loss
- Monitoring overfitting

---

# Team Collaboration Workflow

## Data Science
Responsible for:
- dataset collection
- EDA
- preprocessing
- feature engineering

## AI Engineer
Responsible for:
- model development
- training pipeline
- inference
- deployment
- API integration

## Backend Engineer
Responsible for:
- API integration
- authentication
- database
- deployment server

## Frontend Engineer
Responsible for:
- UI/UX
- dashboard
- visualization
- user interaction

---

# Recommended Workflow Order

## Week 1
- Setup project
- Setup environment
- Design architecture

## Week 2
- Build AI pipeline
- Build custom component
- Setup inference

## Week 3
- Integrate dataset
- Train model

## Week 4
- Evaluation
- Optimization
- Export model

## Week 5
- API integration
- Frontend integration
- Final testing

---

# Deliverables

## Mandatory
- Deep Learning Model
- TensorFlow Functional API/Subclassing
- Custom Component
- Saved Model
- Inference Code

## Optional
- REST API
- TensorBoard
- Custom Training Loop
- Generative AI API
- Deployment

---

# Final Notes

AI Engineer tidak harus menunggu dataset final untuk mulai bekerja.

Bagian yang dapat dikerjakan lebih awal:
- project structure
- pipeline
- model architecture
- custom component
- API preparation
- inference system

Dataset final hanya dibutuhkan pada tahap:
- training
- evaluation
- tuning
- final testing