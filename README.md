# 🏛️ AI Code Archaeologist

AI Code Archaeologist is an intelligent system designed to analyze, understand, and visualize large legacy codebases. It combines static code analysis, graph-based dependency modeling, and AI-driven semantic reasoning to help developers explore complex software architectures efficiently.

The system features an interactive 3D dependency graph with clustering, semantic insights using embeddings, and real-time analysis to improve code comprehension, onboarding, and maintenance.

---

## 🚀 Features
- Static analysis of large codebases using Tree-sitter
- Dependency graph construction with NetworkX
- Community detection and clustering using the Louvain algorithm
- Semantic code understanding using sentence embeddings and FAISS
- Interactive 3D visualization of code relationships
- Backend API built with FastAPI

---

## 🛠️ Tech Stack
**Backend**
- FastAPI, Uvicorn
- NetworkX, Tree-sitter, Tree-sitter-Java
- Sentence-Transformers, FAISS
- Scikit-learn, NumPy

**Frontend**
- React
- ForceGraph3D

---

## ▶️ Running the Project

### Backend

1. Open a terminal in the root directory.

2. Create a virtual environment:
   ```bash
   python -m venv venv

3. Activate virtual environment: 
   ```powershell
   .\venv\Scripts\activate
   ```
4. Install dependencies (if not done):
   ```bash
   pip install -r backend/requirements.txt
   ```
5. Start the server (as a module):
   ```bash
   python -m backend.main
   ```
   *Note: We use `-m backend.main` instead of `backend/main.py` to support relative imports within the package.*

### Frontend
1. Open a new terminal in the root directory.
2. Navigate to frontend:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
