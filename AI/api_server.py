import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from src.inference.predict import load_inference_components, preprocess_input, predict
import google.generativeai as genai

# Configure Google Gemini API Key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyBoNKklA2iBy1XOQgqWmi68WDrMZjp5gBs")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Exam Score Predictor AI")

# Load inference components
# Set environment variable USE_VERTEX=true to enable Vertex AI inference
use_vertex = bool(os.getenv("VERTEX_ENDPOINT_ID"))

# Unified helper that returns the appropriate components
from google_ai_client import get_inference_components, vertex_predict
model, preprocessor, endpoint_resource = get_inference_components(use_vertex)
# ``model`` is None when using Vertex AI; ``endpoint_resource`` holds the full resource name
if use_vertex:
    print(f"🔧 Using Vertex AI endpoint: {endpoint_resource}")
else:
    print("✅ Loaded local TensorFlow model and preprocessor")
    endpoint_resource = None

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

def generate_recommendations(model, preprocessor, baseline_input, baseline_score):
    recommendations = []

    scenarios = []

    # 1. Study Hours
    curr_hours = baseline_input.get("Hours_Studied", 0)
    if curr_hours < 30:
        target_hours = min(35, curr_hours + 5)
        scenarios.append({
            "field": "Hours_Studied",
            "val": target_hours,
            "desc": f"Meningkatkan jam belajar mingguan siswa dari {curr_hours} menjadi {target_hours} jam"
        })

    # 2. Sleep Hours
    curr_sleep = baseline_input.get("Sleep_Hours", 0)
    if curr_sleep < 8:
        target_sleep = 8
        scenarios.append({
            "field": "Sleep_Hours",
            "val": target_sleep,
            "desc": f"Mengoptimalkan waktu tidur siswa dari {curr_sleep} menjadi {target_sleep} jam"
        })

    # 3. Tutoring Sessions
    curr_tutor = baseline_input.get("Tutoring_Sessions", 0)
    if curr_tutor < 5:
        target_tutor = min(8, curr_tutor + 2)
        scenarios.append({
            "field": "Tutoring_Sessions",
            "val": target_tutor,
            "desc": f"Menambah sesi tutor dari {curr_tutor} menjadi {target_tutor}"
        })

    # 4. Physical Activity
    curr_phys = baseline_input.get("Physical_Activity", 0)
    if curr_phys < 5:
        target_phys = min(6, curr_phys + 2)
        scenarios.append({
            "field": "Physical_Activity",
            "val": target_phys,
            "desc": f"Meningkatkan aktivitas fisik dari {curr_phys} menjadi {target_phys} jam/minggu"
        })

    # 5. Motivation
    curr_motiv = baseline_input.get("Motivation_Level", "Medium")
    if curr_motiv != "High":
        scenarios.append({
            "field": "Motivation_Level",
            "val": "High",
            "desc": f"Meningkatkan motivasi belajar dari {curr_motiv} menjadi High"
        })

    # 6. Parental Involvement
    curr_parent = baseline_input.get("Parental_Involvement", "Medium")
    if curr_parent != "High":
        scenarios.append({
            "field": "Parental_Involvement",
            "val": "High",
            "desc": f"Meningkatkan keterlibatan orang tua dari {curr_parent} menjadi High"
        })

    for scenario in scenarios:
        temp_data = baseline_input.copy()
        temp_data[scenario["field"]] = scenario["val"]

        try:
            if use_vertex:
                # Vertex AI expects a list of instances
                score = vertex_predict(endpoint_resource, [temp_data])[0]
            else:
                processed = preprocess_input(
                    temp_data,
                    preprocessor
                )
                score = predict(model, processed)
            
            score = max(0.0, min(100.0, score))

            improvement = score - baseline_score

            if improvement > 0.05:
                recommendations.append({
                    "description": scenario["desc"],
                    "improvement": round(improvement, 2),
                    "new_score": round(score, 2)
                })

        except:
            continue

    recommendations.sort(
        key=lambda x: x["improvement"],
        reverse=True
    )

    return recommendations

class ChatRequest(BaseModel):
    student_stats: PredictionRequest
    user_message: str

@app.post("/recommend")
def recommend(request: PredictionRequest):
    try:
        input_dict = request.dict()

        processed_data = preprocess_input(
            input_dict,
            preprocessor
        )

        baseline_score = predict(
            model,
            processed_data
        )

        baseline_score = max(
            0.0,
            min(100.0, baseline_score)
        )

        recommendations = generate_recommendations(
            model=model,
            preprocessor=preprocessor,
            baseline_input=input_dict,
            baseline_score=baseline_score
        )

        # Generate personalized and interactive explanation using Google Gemini API
        generative_explanation = ""
        try:
            prompt = f"""
            Anda adalah Konselor Pendidikan AI yang ramah, empati, dan profesional. 
            Tugas Anda adalah menganalisis prediksi nilai ujian siswa berikut dan menyusun penjelasan yang memotivasi serta memberikan saran belajar yang konkret berdasarkan rekomendasi tindakan dari sistem AI kami.

            === INFORMASI SISWA ===
            - Prediksi Nilai Ujian Saat Ini: {round(baseline_score, 2)} dari 100
            - Statistik Masukan Siswa: {input_dict}

            === REKOMENDASI AI UNTUK PENINGKATAN ===
            {recommendations}

            === INSTRUKSI STRUKTUR OUTPUT ===
            Tuliskan dalam Bahasa Indonesia yang interaktif dan menyemangati:
            1. Sapaan hangat dan analisis singkat mengenai prediksi nilainya saat ini.
            2. Penjelasan mengapa tindakan-tindakan rekomendasi di atas penting (hubungkan secara ilmiah/logis dengan performa siswa, misalnya jam tidur memengaruhi konsentrasi, dll.).
            3. Kalimat penyemangat penutup yang kuat.
            Tulis penjelasan dengan format Markdown yang rapi (gunakan emoji jika sesuai).
            """
            
            gemini_model = genai.GenerativeModel("gemini-1.5-flash")
            response = gemini_model.generate_content(prompt)
            generative_explanation = response.text.strip()
        except Exception as gemini_err:
            generative_explanation = f"Gagal menghasilkan penjelasan AI Generatif: {str(gemini_err)}"

        return {
            "status": "success",
            "predicted_exam_score": round(baseline_score, 2),
            "recommendation_count": len(recommendations),
            "recommendations": recommendations,
            "generative_explanation": generative_explanation
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@app.post("/chat-advisor")
def chat_advisor(request: ChatRequest):
    try:
        stats = request.student_stats.dict()
        user_msg = request.user_message
        
        # Calculate baseline prediction using our ML model
        processed_data = preprocess_input(stats, preprocessor)
        baseline_score = predict(model, processed_data)
        baseline_score = max(0.0, min(100.0, baseline_score))
        
        prompt = f"""
        Anda adalah Konselor Pendidikan AI yang ramah dan ahli. 
        Siswa saat ini memiliki statistik belajar sebagai berikut:
        {stats}
        
        Prediksi nilai ujian mereka saat ini menggunakan model Deep Learning kami adalah: {round(baseline_score, 2)} / 100.
        
        Siswa mengajukan pertanyaan berikut kepada Anda:
        "{user_msg}"
        
        Tugas Anda:
        1. Jawab pertanyaan siswa tersebut dengan ramah, memotivasi, dan logis secara ilmiah dalam Bahasa Indonesia.
        2. Hubungkan jawaban Anda dengan statistik belajarnya saat ini jika relevan.
        3. Format tanggapan Anda menggunakan Markdown agar mudah dibaca di aplikasi (gunakan bullet points, bold text, dll.).
        """
        
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        response = gemini_model.generate_content(prompt)
        
        return {
            "status": "success",
            "predicted_score": round(baseline_score, 2),
            "answer": response.text.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

