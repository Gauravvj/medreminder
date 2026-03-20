import requests
from PIL import Image

# Create dummy image
img = Image.new('RGB', (100, 100), color=(255, 255, 255))
img.save('test_empty.jpg')

with open('test_empty.jpg', 'rb') as f:
    files = {'image': f}
    data = {'expected_pill': 'Ibuprofen'}
    response = requests.post('http://localhost:8000/verify-pill', files=files, data=data)
    print("Test No Text:", response.json())

# With text matching
from PIL import ImageDraw
img2 = Image.new('RGB', (100, 100), color=(255, 255, 255))
d = ImageDraw.Draw(img2)
d.text((10, 10), "ibuprofen", fill=(0,0,0))
img2.save('test_match.jpg')

with open('test_match.jpg', 'rb') as f:
    files = {'image': f}
    data = {'expected_pill': 'Ibuprofen'}
    response = requests.post('http://localhost:8000/verify-pill', files=files, data=data)
    print("Test With Text:", response.json())
