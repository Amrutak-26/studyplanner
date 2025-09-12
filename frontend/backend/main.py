
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from huggingface_hub import InferenceClient
import json, re, os
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")

# Initialize Hugging Face client
client = InferenceClient("mistralai/Mistral-7B-Instruct-v0.3", token=HF_TOKEN)

app = FastAPI(
    title="Study Planner API",
    description="AI-powered study planner API",
    version="1.0.0"
)

# --- CORS Configuration - Allow all origins for now ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def home():
    return {
        "message": "Study Planner API is running!",
        "status": "healthy",
        "version": "1.0.0",
        "cors_enabled": True
    }

@app.get("/test")
def test_endpoint():
    return {
        "message": "Test endpoint working!",
        "timestamp": "2024-01-01T00:00:00Z",
        "cors_test": "success"
    }

# Pydantic model
class StudyRequest(BaseModel):
    topic: str
    hours_per_day: int
    days: int
    goal: str

@app.post("/generate_plan")
async def generate_plan(req: StudyRequest):
    try:
        # Validate input
        if not req.topic or not req.topic.strip():
            raise HTTPException(status_code=400, detail="Topic is required")
        if req.hours_per_day <= 0:
            raise HTTPException(status_code=400, detail="Hours per day must be greater than 0")
        if req.days <= 0:
            raise HTTPException(status_code=400, detail="Days must be greater than 0")

        # Check if HF_TOKEN is available
        if not HF_TOKEN:
            # Return a fallback study plan if no HF token
            return generate_fallback_plan(req)

        prompt = f"""
You are a study planner assistant.
Create a {req.days}-day study plan for learning {req.topic}.
The learner has {req.hours_per_day} hours per day.
Goal: {req.goal}.
Return ONLY valid JSON list with no explanations or extra text.

Format:
[
  {{"Day":1, "Topics":["..."], "Tasks":["..."], "Quiz":"Suggested quiz topic"}},
  {{"Day":2, "Topics":["..."], "Tasks":["..."], "Quiz":"Suggested quiz topic"}}
]
"""
        
        response = client.chat_completion(
            model="mistralai/Mistral-7B-Instruct-v0.3",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
        )

        text = response.choices[0].message["content"]

        # Try to parse JSON directly
        try:
            parsed_data = json.loads(text)
            return parsed_data
        except json.JSONDecodeError:
            # Try to extract JSON from the response
            match = re.search(r"\[.*\]", text, re.S)
            if match:
                try:
                    parsed_data = json.loads(match.group(0))
                    return parsed_data
                except json.JSONDecodeError as e:
                    return {
                        "error": f"Failed to parse extracted JSON: {str(e)}", 
                        "raw": text,
                        "extracted": match.group(0)
                    }
            else:
                return {
                    "error": "AI response does not contain valid JSON", 
                    "raw": text
                }

    except HTTPException:
        raise
    except Exception as e:
        # Return fallback plan if AI fails
        return generate_fallback_plan(req)

def generate_fallback_plan(req: StudyRequest):
    """Generate a simple fallback study plan without AI"""
    plan = []
    topics_per_day = max(1, req.days // 3)  # Distribute topics across days
    
    for day in range(1, req.days + 1):
        day_plan = {
            "Day": day,
            "Topics": [
                f"Introduction to {req.topic}",
                f"Basic concepts of {req.topic}",
                f"Practical applications of {req.topic}"
            ][:topics_per_day],
            "Tasks": [
                f"Study {req.topic} fundamentals for {req.hours_per_day} hours",
                f"Practice {req.topic} exercises",
                f"Review {req.topic} concepts",
                f"Complete {req.topic} assignments"
            ],
            "Quiz": f"Test your knowledge of {req.topic} basics"
        }
        plan.append(day_plan)
    
    return plan

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Study Planner API is running",
        "version": "1.0.0"
    }

# Add startup event
@app.on_event("startup")
async def startup_event():
    print("Study Planner API is starting up...")
    print(f"Hugging Face token configured: {'Yes' if HF_TOKEN else 'No'}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
