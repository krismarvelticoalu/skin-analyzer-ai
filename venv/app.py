from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os
import random
from PIL import Image

# Flask setup
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Dummy classifier: Replace this with your actual model
def analyze_skin_type(image_path):
    # You can load and process the image here
    # image = Image.open(image_path)
    skin_types = ['Oily', 'Dry', 'Normal']
    return random.choice(skin_types)

# Sample skincare recommendations
RECOMMENDATIONS = {
    'Oily': [
        "Use a gentle foaming cleanser.",
        "Apply oil-free moisturizer.",
        "Avoid heavy creams.",
        "Use products with salicylic acid."
    ],
    'Dry': [
        "Use a rich, hydrating moisturizer.",
        "Avoid alcohol-based products.",
        "Use a humidifier indoors.",
        "Cleanse with cream-based cleansers."
    ],
    'Normal': [
        "Maintain a balanced skincare routine.",
        "Use sunscreen daily.",
        "Exfoliate once or twice a week.",
        "Use a mild cleanser."
    ]
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    # Call your model or skin analysis logic
    skin_type = analyze_skin_type(file_path)
    recommendations = RECOMMENDATIONS.get(skin_type, [])

    return jsonify({
        'skin_type': skin_type,
        'recommendations': recommendations
    })

if __name__ == '__main__':
    app.run(debug=True)
