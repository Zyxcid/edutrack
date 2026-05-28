import os
import sys
import pandas as pd

# Add the AI directory to Python search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure stdout to use UTF-8 encoding (prevents emoji crashes on Windows)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from src.inference.predict import load_inference_components, preprocess_input, predict

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_banner():
    banner = """
=========================================================
 🎓  EXAM SCORE PREDICTOR AI - INTERACTIVE TESTER  🎓
=========================================================
 This program allows you to enter student statistics
 and predict their final exam score using our trained
 Deep Learning model.
 
 Press Enter to use the [default] value for any prompt.
=========================================================
"""
    print(banner)

def get_input(prompt_text, type_fn, default=None, options=None):
    while True:
        options_str = f" ({'/'.join(options)})" if options else ""
        default_str = f" [Default: {default}]" if default is not None else ""
        full_prompt = f"👉 {prompt_text}{options_str}{default_str}: "
        
        user_input = input(full_prompt).strip()
        
        if not user_input:
            if default is not None:
                return default
            else:
                print("❌ Input cannot be empty. Please enter a value.")
                continue
                
        # Validate options
        if options:
            # Normalize to match casing in options
            matched = None
            for opt in options:
                if user_input.lower() == opt.lower():
                    matched = opt
                    break
            if matched:
                return matched
            else:
                print(f"❌ Invalid option. Choose from: {', '.join(options)}")
                continue
                
        # Validate type
        try:
            val = type_fn(user_input)
            # Extra numeric bounds check
            if type_fn in (int, float) and val < 0:
                print("❌ Value must be non-negative.")
                continue
            return val
        except ValueError:
            print(f"❌ Invalid input type. Please enter a valid {type_fn.__name__}.")

def generate_recommendations(model, preprocessor, baseline_input, baseline_score):
    recommendations = []
    
    # Define actionable scenarios
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
        target_sleep = 8.0
        scenarios.append({
            "field": "Sleep_Hours",
            "val": target_sleep,
            "desc": f"Mengoptimalkan waktu tidur malam siswa dari {curr_sleep} menjadi 8.0 jam"
        })
        
    # 3. Tutoring Sessions
    curr_tutor = baseline_input.get("Tutoring_Sessions", 0)
    if curr_tutor < 5:
        target_tutor = min(8, curr_tutor + 2)
        scenarios.append({
            "field": "Tutoring_Sessions",
            "val": target_tutor,
            "desc": f"Mengikuti {target_tutor - curr_tutor} sesi les/tutor tambahan per bulan (dari {curr_tutor} ke {target_tutor} sesi)"
        })
        
    # 4. Physical Activity
    curr_phys = baseline_input.get("Physical_Activity", 0)
    if curr_phys < 5:
        target_phys = min(6, curr_phys + 2)
        scenarios.append({
            "field": "Physical_Activity",
            "val": target_phys,
            "desc": f"Meningkatkan aktivitas fisik mingguan sebanyak 2 jam (dari {curr_phys} ke {target_phys} jam)"
        })
        
    # 5. Motivation Level
    curr_motiv = baseline_input.get("Motivation_Level", "Medium")
    if curr_motiv != "High":
        scenarios.append({
            "field": "Motivation_Level",
            "val": "High",
            "desc": f"Meningkatkan motivasi belajar siswa (dari '{curr_motiv}' menjadi 'High')"
        })
        
    # 6. Parental Involvement
    curr_parent = baseline_input.get("Parental_Involvement", "Medium")
    if curr_parent != "High":
        scenarios.append({
            "field": "Parental_Involvement",
            "val": "High",
            "desc": f"Meningkatkan dukungan/keterlibatan orang tua (dari '{curr_parent}' menjadi 'High')"
        })

    # Run predictions for each scenario
    for scenario in scenarios:
        test_data = baseline_input.copy()
        test_data[scenario["field"]] = scenario["val"]
        
        try:
            processed = preprocess_input(test_data, preprocessor)
            score = predict(model, processed)
            score = max(0.0, min(100.0, score))
            improvement = score - baseline_score
            
            if improvement > 0.05:  # Only recommend if it actually helps
                recommendations.append({
                    "desc": scenario["desc"],
                    "improvement": improvement,
                    "new_score": score
                })
        except Exception:
            pass
            
    # Sort recommendations by improvement in descending order
    recommendations.sort(key=lambda x: x["improvement"], reverse=True)
    return recommendations

def main():
    clear_screen()
    print_banner()
    
    print("⏳ Loading AI model and preprocessor (this may take a few seconds)...")
    try:
        model, preprocessor = load_inference_components(
            model_path="saved_model/model.keras",
            preprocessor_path="saved_model/preprocessor.pkl"
        )
        print("✅ Model loaded successfully!\n")
    except Exception as e:
        print(f"❌ Failed to load model components: {e}")
        print("Please ensure you are in the AI directory and that saved_model/ exists.")
        sys.exit(1)
        
    while True:
        print("--- Enter Student Information ---")
        
        student_data = {}
        
        # 1. Hours Studied
        student_data["Hours_Studied"] = get_input("Hours Studied per Week", int, default=15)
        
        # 2. Attendance
        student_data["Attendance"] = get_input("Attendance Percentage (0-100)", int, default=85)
        
        # 3. Parental Involvement
        student_data["Parental_Involvement"] = get_input("Parental Involvement", str, default="Medium", options=["Low", "Medium", "High"])
        
        # 4. Access to Resources
        student_data["Access_to_Resources"] = get_input("Access to Resources", str, default="Medium", options=["Low", "Medium", "High"])
        
        # 5. Extracurricular Activities
        student_data["Extracurricular_Activities"] = get_input("Extracurricular Activities", str, default="No", options=["Yes", "No"])
        
        # 6. Sleep Hours
        student_data["Sleep_Hours"] = get_input("Average Sleep Hours per Night", float, default=7.0)
        
        # 7. Previous Scores
        student_data["Previous_Scores"] = get_input("Previous Exam Score (0-100)", int, default=70)
        
        # 8. Motivation Level
        student_data["Motivation_Level"] = get_input("Student Motivation Level", str, default="Medium", options=["Low", "Medium", "High"])
        
        # 9. Internet Access
        student_data["Internet_Access"] = get_input("Internet Access at Home", str, default="Yes", options=["Yes", "No"])
        
        # 10. Tutoring Sessions
        student_data["Tutoring_Sessions"] = get_input("Monthly Tutoring Sessions Attended", int, default=0)
        
        # 11. Family Income
        student_data["Family_Income"] = get_input("Family Income Level", str, default="Medium", options=["Low", "Medium", "High"])
        
        # 12. Teacher Quality
        student_data["Teacher_Quality"] = get_input("Teacher Quality Rating", str, default="Medium", options=["Low", "Medium", "High"])
        
        # 13. School Type
        student_data["School_Type"] = get_input("School Type", str, default="Public", options=["Public", "Private"])
        
        # 14. Peer Influence
        student_data["Peer_Influence"] = get_input("Peer Influence", str, default="Neutral", options=["Positive", "Neutral", "Negative"])
        
        # 15. Physical Activity
        student_data["Physical_Activity"] = get_input("Physical Activity Hours per Week", int, default=3)
        
        # 16. Learning Disabilities
        student_data["Learning_Disabilities"] = get_input("Learning Disabilities", str, default="No", options=["Yes", "No"])
        
        # 17. Parental Education Level
        student_data["Parental_Education_Level"] = get_input("Parental Education Level", str, default="High School", options=["High School", "College", "Postgraduate"])
        
        # 18. Distance from Home
        student_data["Distance_from_Home"] = get_input("Distance from Home to School", str, default="Near", options=["Near", "Moderate", "Far"])
        
        # 19. Gender
        student_data["Gender"] = get_input("Gender", str, default="Male", options=["Male", "Female"])
        
        # Display entered values summary
        print("\n=========================================================")
        print(" 📊  SUMMARY OF INPUT DATA")
        print("=========================================================")
        for key, val in student_data.items():
            print(f" {key.replace('_', ' '):<30}: {val}")
        print("=========================================================\n")
        
        # Predict
        print("🔮 Calculating prediction...")
        try:
            processed = preprocess_input(student_data, preprocessor)
            predicted_score = predict(model, processed)
            
            # Bound score to realistic range (0-100)
            predicted_score = max(0.0, min(100.0, predicted_score))
            
            print("\n🌟========================================================🌟")
            print(f"   🎯  PREDICTED FINAL EXAM SCORE: {predicted_score:.2f} / 100")
            print("🌟========================================================🌟\n")
            
            # Generate actionable recommendations based on what-if simulations
            recs = generate_recommendations(model, preprocessor, student_data, predicted_score)
            
            if recs:
                print("🎯========================================================🎯")
                print("       🚀 AI PERSONALIZED ACTION RECOMMENDATIONS")
                print("🎯========================================================🎯")
                print(" Rekomendasi di bawah diurutkan berdasarkan potensi dampak")
                print(" peningkatan nilai terbesar bagi siswa:\n")
                
                medals = ["🥇 [REKOMENDASI UTAMA]", "🥈 [REKOMENDASI KEDUA]", "🥉 [REKOMENDASI KETIGA]"]
                for idx, rec in enumerate(recs[:3]):
                    medal = medals[idx] if idx < len(medals) else f"👉 [TINDAKAN {idx+1}]"
                    print(f" {medal}")
                    print(f"    💡 Tindakan  : {rec['desc']}")
                    print(f"    📈 Dampak    : +{rec['improvement']:.2f} Poin (Prediksi Nilai menjadi: {rec['new_score']:.2f})")
                    print()
                print("============================================================\n")
            else:
                print("✨ Luar biasa! Siswa Anda sudah memiliki profil performa yang optimal.")
                print("Tidak ada rekomendasi peningkatan lebih lanjut yang signifikan.\n")
                
        except Exception as e:
            print(f"❌ Error during prediction: {e}")
            import traceback
            traceback.print_exc()
            
        # Ask to repeat
        another = input("🔄 Do you want to run another test? (yes/no) [Default: yes]: ").strip().lower()
        if another in ('no', 'n'):
            print("\n👋 Thank you for using Exam Score Predictor AI! Goodbye.")
            break
        clear_screen()
        print_banner()

if __name__ == "__main__":
    main()
