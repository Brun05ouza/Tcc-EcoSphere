from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# Carregar modelo treinado
MODEL_PATH = 'models/waste_classifier.h5'
model = None

# Classes de resíduos
WASTE_CLASSES = ['plastico', 'papel', 'vidro', 'metal', 'organico']

# Dicas de descarte por tipo
WASTE_TIPS = {
    'plastico': 'Lave o recipiente antes do descarte. Remova tampas e rótulos quando possível.',
    'papel': 'Certifique-se de que o papel está limpo e seco. Papéis molhados ou sujos vão no lixo comum.',
    'vidro': 'Remova tampas e rótulos. Cuidado com vidros quebrados - embale adequadamente.',
    'metal': 'Lave latas e recipientes. Remova rótulos quando possível.',
    'organico': 'Ideal para compostagem. Evite misturar com outros tipos de resíduo.'
}

def load_model():
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            print("Modelo carregado com sucesso!")
        else:
            print("Modelo não encontrado. Usando classificação simulada.")
            model = None
    except Exception as e:
        print(f"Erro ao carregar modelo: {e}")
        model = None

def preprocess_image(image_file):
    """Preprocessa a imagem para o modelo"""
    try:
        # Abrir e redimensionar imagem
        image = Image.open(io.BytesIO(image_file.read()))
        image = image.convert('RGB')
        image = image.resize((224, 224))
        
        # Converter para array numpy e normalizar
        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    except Exception as e:
        print(f"Erro no preprocessamento: {e}")
        return None

def simulate_classification():
    """Simulação de classificação quando o modelo não está disponível"""
    import random
    
    waste_type = random.choice(WASTE_CLASSES)
    confidence = random.uniform(0.7, 0.95)
    
    return waste_type, confidence

@app.route('/classify', methods=['POST'])
def classify_waste():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'Nenhuma imagem enviada'}), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({'error': 'Nenhuma imagem selecionada'}), 400
        
        # Preprocessar imagem
        processed_image = preprocess_image(image_file)
        
        if processed_image is None:
            return jsonify({'error': 'Erro ao processar imagem'}), 400
        
        # Classificar
        if model is not None:
            # Usar modelo real
            predictions = model.predict(processed_image)
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx])
            waste_type = WASTE_CLASSES[predicted_class_idx]
        else:
            # Usar simulação
            waste_type, confidence = simulate_classification()
        
        # Calcular pontos baseado na confiança
        points = int(confidence * 100)
        
        response = {
            'type': waste_type,
            'confidence': confidence,
            'points': points,
            'tips': WASTE_TIPS.get(waste_type, 'Descarte adequadamente conforme as normas locais.'),
            'recycling_locations': f'Encontre pontos de coleta próximos para {waste_type}'
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Erro na classificação: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'available_classes': WASTE_CLASSES
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    """Retorna estatísticas do serviço de IA"""
    return jsonify({
        'total_classifications': 1247,  # Simulado
        'accuracy': 0.89,  # Simulado
        'most_classified': 'plastico',
        'supported_formats': ['jpg', 'jpeg', 'png', 'webp']
    })

if __name__ == '__main__':
    load_model()
    print(f"IA Service rodando em:")
    print(f"Local: http://localhost:8000")
    print(f"Rede: http://172.16.42.65:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)