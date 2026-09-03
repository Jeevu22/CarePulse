# PulseWatch 🫀

Real-time ECG Analysis & Cardiac Risk Monitoring Platform.

## 📁 Repository Structure

```
pulsewatch-project/
├── backend/            # FastAPI / Python backend with ML models
│   ├── app.py          # API server & WebSocket endpoints
│   ├── models/         # Machine learning model artifacts & predictors
│   └── requirements.txt# Python dependencies
├── frontend/           # Next.js + React + Tailwind CSS web dashboard
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Reusable UI components & modals
│   └── package.json    # Frontend dependencies
└── README.md
```

---

## ⚡ Quick Start with Docker (Recommended)

Run both the **Frontend** and **Backend** together without installing Node or Python locally:

```bash
# Start both services
docker compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

To stop the containers:
```bash
docker compose down
```

---

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   - **Windows**:
     ```bash
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn app:app --reload --port 8000
   ```
   Backend will be live at `http://localhost:8000`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Collaboration & Git Workflow

- Pull the latest changes before starting work:
  ```bash
  git pull origin main
  ```
- Create a new feature branch for your work:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Commit and push your changes:
  ```bash
  git add .
  git commit -m "Add: description of your changes"
  git push origin feature/your-feature-name
  ```
