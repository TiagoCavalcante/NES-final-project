# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow all origins; should be changed in production

@app.route('/api/message', methods=['GET'])
def message():
    return jsonify({"message": "Hello from Flask!"})

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.json
    return jsonify({"you_sent": data}), 201

if __name__ == '__main__':
    app.run(debug=True)
