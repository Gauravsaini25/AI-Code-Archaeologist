# AI Code Archaeologist

## Running the Project

### Backend
1. Open a terminal in the root directory.
2. Activate virtual environment: 
   ```powershell
   .\venv\Scripts\activate
   ```
3. Install dependencies (if not done):
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Start the server (as a module):
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
