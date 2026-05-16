from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from src.inference.predict import load_inference_components, preprocess_input, predict

app = FastAPI(title="Exam Score Predictor AI")

print("Loading model components...")
model, preprocessor = load_inference_components(
    model_path="saved_model/model.keras",
    preprocessor_path="saved_model/preprocessor.pkl"
)
print("Model loaded successfully!")

class PredictionRequest(BaseModel):
    Hours_Studied: int
    Attendance: int
    Parental_Involvement: str
    Access_to_Resources: str
    Extracurricular_Activities: str
    Sleep_Hours: int
    Previous_Scores: int
    Motivation_Level: str
    Internet_Access: str
    Tutoring_Sessions: int
    Family_Income: str
    Teacher_Quality: str
    School_Type: str
    Peer_Influence: str
    Physical_Activity: int
    Learning_Disabilities: str
    Parental_Education_Level: str
    Distance_from_Home: str
    Gender: str

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Exam Score Predictor is running."}

@app.post("/predict")
def predict_score(request: PredictionRequest):
    try:
        input_dict = request.dict()
        processed_data = preprocess_input(input_dict, preprocessor)
        score = predict(model, processed_data)
        
        return {
            "predicted_exam_score": score,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
