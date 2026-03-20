import easyocr
import os
from PIL import Image, ImageDraw, ImageFont

def generate_test_image(text, filename="test_pill.jpg"):
    img = Image.new('RGB', (400, 200), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    # Use default font
    # To make it large we might need a truetype font, but default is fine if we scale
    d.text((50, 80), text, fill=(0, 0, 0), font_size=30 if hasattr(ImageFont, "truetype") else None)
    img.save(filename)
    print(f"Generated {filename} with text: {text}")

def main():
    print("Initializing Reader...")
    reader = easyocr.Reader(['en'], gpu=False)
    
    print("Testing with generated image...")
    generate_test_image("Aspirin 500mg")
    
    results = reader.readtext("test_pill.jpg")
    print("Raw results:", results)
    
    extracted = [text for _, text, _ in results]
    print("Extracted text:", " ".join(extracted))

if __name__ == "__main__":
    main()
