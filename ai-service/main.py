"""
AI Microservice for Smart Medicine Reminder
Provides simulated pill verification via camera image analysis.

In production, this would use a trained ML model (e.g., TensorFlow/PyTorch)
to identify pills from images. For this demo, it returns simulated results.
"""

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import easyocr

app = FastAPI(title="MedReminder AI Service", version="1.0.0")

# Initialize easyocr reader globally
try:
    reader = easyocr.Reader(['en'], gpu=False)
except Exception as e:
    print(f"Error initializing easyocr: {e}")
    reader = None

# Allow cross-origin requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "OK", "message": "AI Microservice is running"}


@app.post("/verify-pill")
async def verify_pill(
    image: UploadFile = File(...),
    expected_pill: str = Form(None)
):
    """
    Accepts an image file of a pill and the expected pill name,
    runs OCR on the image, and verifies if the text contains the expected pill.
    """
    contents = await image.read()
    file_size = len(contents)

    if not reader:
        return {
            "verified": False,
            "confidence": 0.0,
            "pill_name": expected_pill or "Unknown",
            "message": "OCR service not initialized. Please check backend logs.",
            "image_size_bytes": file_size,
        }

    try:
        results = reader.readtext(contents)
        extracted_texts = [text for _, text, _ in results]
        full_extracted_text = " ".join(extracted_texts).lower()

        is_verified = False
        confidence = 0.0
        
        if expected_pill:
            expected_lower = expected_pill.lower()
            if expected_lower in full_extracted_text:
                is_verified = True
                confidence = 0.95
            else:
                parts = expected_lower.split()
                if any(len(p) > 3 and p in full_extracted_text for p in parts):
                    is_verified = True
                    confidence = 0.75

        return {
            "verified": is_verified,
            "confidence": confidence,
            "pill_name": expected_pill if expected_pill else "Unknown",
            "message": "Pill verified successfully" if is_verified else f"Could not verify. Text found: '{full_extracted_text[:50]}'. Please ensure the label is clearly visible.",
            "image_size_bytes": file_size,
        }
    except Exception as e:
        return {
            "verified": False,
            "confidence": 0.0,
            "pill_name": expected_pill or "Unknown",
            "message": f"Error processing image: {str(e)}",
            "image_size_bytes": file_size,
        }

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
