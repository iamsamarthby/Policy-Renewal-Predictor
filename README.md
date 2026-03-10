# Policy Renewal Predictor

A comprehensive full-stack application that leverages Machine Learning and Generative AI to predict insurance policy renewals and recommend tailored customer engagement strategies to prevent churn.

## Overview
The **Policy Renewal Predictor** uses a 50,000-row synthetic dataset to predict the likelihood of an insurance customer churning. It calculates the risk via an XGBoost ML model and can generate personalized, AI-driven retention strategies through Google's Gemini API. 

The application offers an intuitive and dynamic React dashboard to visualize key performance indicators (KPIs), churn regions, policy types, and individual customer profiles.

## Technologies Used
- **Frontend**: React, Vite, TailwindCSS (or custom CSS), Recharts, React Router
- **Backend**: Node.js, Express, MySQL (for saving predictions and strategies)
- **Machine Learning**: Python, Flask, XGBoost, scikit-learn, pandas
- **Generative AI**: Local LLM via Ollama (`phi3`, `llama3`, or `mistral`)
- **Vector Database (Optional)**: ChromaDB (for Retrieval-Augmented Generation / context retrieval)

## Architecture
This project is built using a microservices-inspired architecture:
1. **Frontend App React (Port 5173)** - Displays the UI and sends requests to the Node.js backend.
2. **Backend API Node.js (Port 5001)** - Acts as the core server, interacting with MySQL, calling the LLM, and communicating with the ML service.
3. **ML Service Python (Port 5000)** - Handles local machine learning processing, model training, and predictions.

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Python](https://python.org/) 3.10+
- [MySQL](https://mysql.com/) 8+ (or XAMPP)
- [Ollama](https://ollama.com/) (Must be installed and running locally)

### 1. Database Configuration
1. Start your MySQL Server.
2. Initialize the schema located in `database/schema.sql`:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Navigate to the `backend` directory and create a `.env` file (if not present) with your credentials:
   ```env
   DB_PASSWORD=your_mysql_password
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=phi3
   ```

### 2. Machine Learning Service (Python)
1. Navigate to the `ml` folder and install requirements:
   ```bash
   cd ml
   pip install -r requirements.txt
   ```
2. Train the XGBoost model:
   ```bash
   python train.py
   ```
3. Start the Flask ML Server (Leave this running):
   ```bash
   python app.py
   ```

*(Optional)* Run `python embed.py` to build ChromaDB embeddings for Similar Customer Data.

### 3. Backend API (Node.js)
1. Open a new terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *(Ensure it connects properly to your MySQL DB and loads CSV resources successfully).*

### 4. Frontend UI (React)
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser and access `http://localhost:5173`.

## Features
- **Dashboard Overview**: Macro-level analytical views on region-based churn, policy risk distributions, and overall customer KPIs.
- **Customer Directory**: Browse and filter safely loaded customer data derived from the dataset.
- **Data Entry**: Add new customers systematically and dynamically calculate predictions for them.
- **AI-Powered Strategies**: In-depth strategy generation based on exact customer features (using local LLMs via Ollama).

## Git Commit Guidelines
When pushing this repository, specific files and directories are ignored (refer to `.gitignore`) to protect credentials and prevent the upload of excessive build sizes:
- Do not commit `.env` files.
- Do not commit `node_modules` or `venv` directories.
- Trained ML models (`.pkl`) and Vector DB records (`chroma_data`) are generated locally and should not be pushed to version control.
