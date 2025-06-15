import os
from flask import Flask, render_template, request, jsonify
from model import generate_caption
from googletrans import Translator
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Folder to store uploaded images
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Allowed image extensions
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

translator = Translator()

# Ensure uploads folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_image():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"})

    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"})

    # Save the file
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    # Generate caption
    caption = generate_caption(filepath)

    return jsonify({"caption": caption, "image_url": filepath})

@app.route("/translate", methods=["POST"])
def translate_caption():
    data = request.json
    caption = data.get("caption", "")
    target_lang = data.get("language", "en")

    if not caption:
        return jsonify({"error": "No caption provided"})

    translated_text = translator.translate(caption, dest=target_lang).text
    return jsonify({"translated_caption": translated_text})

if __name__ == "__main__":
    app.run(debug=True)
