from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os
import numpy as np
from keras.models import load_model
from PIL import Image, ImageOps
from keras.layers import DepthwiseConv2D

app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

# Load the Keras model
MODEL_PATH = 'model/keras_Model.h5'
model = load_model(MODEL_PATH, compile=False)

# Load class labels
LABELS_PATH = 'model/labels.txt'
with open(LABELS_PATH, 'r') as f:
    skin_types = [line.strip() for line in f]

# Recommendations
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

    # Preprocess the image
    image = Image.open(file_path).convert("RGB")
    size = (224, 224)
    image = ImageOps.fit(image, size, Image.Resampling.LANCZOS)
    image_array = np.asarray(image)

    # Normalize the image
    normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1

    # Create the array of the right shape to feed into the Keras model
    data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
    data[0] = normalized_image_array

    # Predict using the model
    predictions = model.predict(data)
    predicted_class = np.argmax(predictions)
    skin_type = skin_types[predicted_class]
    confidence_score = predictions[0][predicted_class]
    recommendations = RECOMMENDATIONS.get(skin_type, [])

    return jsonify({
        'skin_type': skin_type,
        'confidence_score': float(confidence_score),
        'recommendations': recommendations
    })

if __name__ == '__main__':
    app.run(debug=True)