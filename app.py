import requests
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# URL de tu API en Render (reemplázala con la tuya)
API_URL = "https://medication-request-api.onrender.com"

@app.route("/")
def home():
    return render_template("index.html")  # Página principal

@app.route("/medicationrequest", methods=["GET"])
def get_medications():
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route("/medicationrequest", methods=["POST"])
def create_medication():
    try:
        data = {
            "status": request.json.get("status"),
            "intent": request.json.get("intent"),
            "medicationCodeableConcept": {"text": request.json.get("medication")},
            "subject": {"reference": request.json.get("subject")},
            "authoredOn": request.json.get("authoredOn"),
            "requester": {"reference": request.json.get("requester")},
            "dosageInstruction": request.json.get("dosageInstruction", [])
        }
        response = requests.post(API_URL, json=data)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
