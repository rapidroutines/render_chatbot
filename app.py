import json
import os
import numpy as np
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import requests
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()


app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app, resources={r"/*": {"origins": "https://render-chatbot-2.onrender.com"}},
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])



model = SentenceTransformer('all-MiniLM-L6-v2')

class Document:
    def __init__(self, doc_id, content, embedding):
        self.id = doc_id
        self.content = content
        self.embedding = np.array(embedding)

def load_knowledge_base(file_path):
    """
    Loads the knowledge base from a JSON file.
    Each document in the file should include "id", "content", and optionally an "embedding".
    If an embedding is missing, it will be computed using the SentenceTransformer model.
    """
    with open(file_path, "r") as f:
        data = json.load(f)
    docs = []
    for item in data:
        doc_id = item.get("id")
        content = item.get("content")
        embedding = item.get("embedding")
        if embedding is None:
            embedding = model.encode(content).tolist()
        docs.append(Document(doc_id, content, embedding))
    return docs

knowledge_base_file = "knowledge_base.json"
document_embeddings = load_knowledge_base(knowledge_base_file)

def calculate_cosine_similarity(vecA, vecB):
    """Calculates cosine similarity between two vectors."""
    return np.dot(vecA, vecB) / (np.linalg.norm(vecA) * np.linalg.norm(vecB))

def retrieve_relevant_documents(query):
    """
    Computes the embedding for the query,
    then calculates cosine similarity with each document's embedding.
    Returns the content of the top three most similar documents.
    """
    query_embedding = model.encode(query)
    scored_docs = [
        (doc, calculate_cosine_similarity(query_embedding, doc.embedding))
        for doc in document_embeddings
    ]
    scored_docs.sort(key=lambda x: x[1], reverse=True)
    return [doc.content for doc, _ in scored_docs[:3]]

def generate_prompt(query, relevant_docs, context):
    parts = [
        "You are RapidRoutines AI, a helpful calisthenics and fitness assistant. You know everything about fitness which includes: "
        "Weight Loss & Fat Burning, Muscle Building & Strength Training, Nutrition & Diet Planning, Cardio vs. Strength Training, "
        "Recovery & Injury Prevention, and any form of fitness. Provide detailed, accurate information based on the following context:\n\n"
    ]
    if relevant_docs:
        parts.append("RELEVANT INFORMATION:\n")
        parts.extend(f"[{i}] {doc}\n\n" for i, doc in enumerate(relevant_docs, 1))
    if context:
        parts.append("CONVERSATION HISTORY:\n")
        parts.extend(f"{msg.get('role')}: {msg.get('content')}\n" for msg in context[-4:])
    parts.append(f"\nUser query: {query}\n")
    parts.append(
        "Respond in a friendly, helpful manner with accurate information about calisthenics and fitness. "
        "Make the information not too long. If the information is not in the database, do not say it is not there, "
        "use the internet to help instead. Use **bold text** for important points and section headers. "
        "If someone greets you, just greet them with answering only their prompt. Ask a follow up question if the prompt from the user is too general."
    )
    return "".join(parts)

@app.route("/")
def index():
    return redirect("/index.html")

@app.route("/generate", methods=["POST"])
def generate():
    try:
        payload = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    user_query = payload.get("query", "").strip()
    if not user_query:
        return jsonify({"error": "Missing query"}), 400

    conversation_context = payload.get("context", [])
    if not isinstance(conversation_context, list):
        conversation_context = []

    relevant_docs = retrieve_relevant_documents(user_query)
    prompt = generate_prompt(user_query, relevant_docs, conversation_context)

    gemini_request_body = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }


    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        return jsonify({"error": "GEMINI_API_KEY not set in environment variables."}), 500

    gemini_api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    url = f"{gemini_api_url}?key={gemini_api_key}"
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, headers=headers, json=gemini_request_body, timeout=10)
        if "application/json" not in response.headers.get("Content-Type", ""):
            return jsonify({"error": f"Expected JSON but got: {response.text}"}), response.status_code
        return response.text, response.status_code, {"Content-Type": "application/json"}
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
