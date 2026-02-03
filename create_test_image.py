"""
Simple test image generator for Vision API testing
Creates a test image with text
"""

from PIL import Image, ImageDraw, ImageFont

def create_test_image(filename="test_diagram.png"):
    """Create a simple test diagram"""
    # Create a white background
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw some shapes and text
    # Title
    draw.text((300, 50), "Test Diagram", fill='black')
    
    # Box 1
    draw.rectangle([100, 150, 300, 250], outline='blue', width=3)
    draw.text((150, 190), "Component A", fill='blue')
    
    # Box 2
    draw.rectangle([500, 150, 700, 250], outline='green', width=3)
    draw.text((550, 190), "Component B", fill='green')
    
    # Arrow between boxes
    draw.line([300, 200, 500, 200], fill='red', width=2)
    draw.polygon([(490, 195), (500, 200), (490, 205)], fill='red')
    
    # Bottom text
    draw.text((250, 400), "Simple Architecture Diagram", fill='black')
    
    # Save
    img.save(filename)
    print(f"✅ Created test image: {filename}")
    return filename

if __name__ == "__main__":
    create_test_image()
