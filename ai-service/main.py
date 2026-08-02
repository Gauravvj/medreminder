"""
AI Microservice for Smart Medicine Reminder.

Demo version:
Accepts a pill image and returns a simulated verification response.

A production version could replace this logic with an OCR or
trained computer-vision model.
"""

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MedReminder AI Service",
    version="1.0.0"
)

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "status": "OK",
        "message": "MedReminder AI Service is running"
    }


@app.post("/verify-pill")
async def verify_pill(
    image: UploadFile = File(...),
    expected_pill: str = Form(None)
):
    """
    Demo pill verification endpoint.

    Accepts an uploaded image and expected medicine name.
    Verification is simulated in this deployment.
    """

    try:
        contents = await image.read()
        file_size = len(contents)

        # Basic validation
        if file_size == 0:
            return {
                "verified": False,
                "confidence": 0.0,
                "pill_name": expected_pill or "Unknown",
                "message": "No image data received.",
                "image_size_bytes": 0
            }

        if not expected_pill:
            return {
                "verified": False,
                "confidence": 0.0,
                "pill_name": "Unknown",
                "message": "Expected medicine name was not provided.",
                "image_size_bytes": file_size
            }

        # Demo/simulated verification
        return {
            "verified": True,
            "confidence": 0.90,
            "pill_name": expected_pill,
            "message": "Medicine verification successful (demo mode).",
            "image_size_bytes": file_size
        }

    except Exception as e:
        return {
            "verified": False,
            "confidence": 0.0,
            "pill_name": expected_pill or "Unknown",
            "message": f"Error processing image: {str(e)}",
            "image_size_bytes": 0
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000
    )