# Medora AI Document Processing Workflow

This document outlines the end-to-end AI workflow for medical document summarization and analysis in the Medora project.

## 1. Overview
The AI system is designed to handle medical reports, prescriptions, and lab results by extracting structured medical data from PDFs and images. It uses a queue-based asynchronous architecture to ensure reliability and responsiveness.

---

## 2. The Workflow Steps

### Phase 1: Request & Caching (Synchronous)
1.  **Upload**: A client uploads up to 3 documents (<10MB each) to the `/api/ai/summarize` endpoint.
2.  **Hashing**: The system generates a SHA-256 hash of each file to uniquely identify it.
3.  **Cache Check**: It checks the `ai_summaries_cache` table in **Supabase**.
    *   **Cache Hit**: Returns the existing summary immediately.
    *   **Cache Miss**: Proceeds to the queueing phase.

### Phase 2: Queueing (Asynchronous)
1.  **Job Creation**: The file path, mimetype, and hash are added as a job to the **BullMQ** queue.
2.  **Status**: The API returns a `jobId` to the client, allowing them to poll for status.

### Phase 3: Processing (Worker)
1.  **Text Extraction**:
    *   **PDFs**: Uses `pdf-parse` to extract raw text.
    *   **Images**: Uses `Tesseract.js` for OCR (Optical Character Recognition).
2.  **Cleaning**: The extracted text is cleaned and truncated to fit model context windows.
3.  **Vision Analysis**: The file is read as Base64 and sent along with the prompt to the AI provider.

### Phase 4: AI Analysis
1.  **Primary Provider**: **Google Gemini 1.5 Flash** (`gemini-2.5-flash` or `gemini-flash-latest`).
    *   Analyzes both text and visual data (Vision).
    *   Returns structured JSON (Diagnosis, Medications, Complaints, Findings, Reports).
2.  **Fallback Provider**: If Gemini fails (e.g., rate limits), the system uses **OpenRouter** (Gemma 2 9B).

### Phase 5: Persistence & Cleanup
1.  **Storage**: The final summary is saved to the Supabase cache and associated with the patient's record if applicable.
2.  **Cleanup**: The temporary local file is deleted to save space and ensure privacy.
3.  **Notification**: The job is marked as `completed` in the queue.

---

## 3. Core Files & Directory Structure

| Layer | File Path | Description |
| :--- | :--- | :--- |
| **Routes** | `src/routes/ai.routes.js` | Defines endpoints for summarization and job status. |
| **Controller** | `src/controllers/ai.controller.js` | Handles HTTP requests, validation, and cache lookups. |
| **Queue** | `src/queues/aiQueue.js` | Configures BullMQ and Redis connection for jobs. |
| **Worker** | `src/workers/aiWorker.js` | Processes jobs: Text extraction, OCR, and AI orchestration. |
| **Service (Primary)** | `src/services/aiService.js` | Integration with Google Gemini Generative AI. |
| **Service (Fallback)**| `src/services/aiService.js` | Integration with OpenRouter API. |
| **Database** | `src/config/supabase.js` | Supabase client for caching summaries. |
| **Utilities** | `src/utils/hash.js` | File hashing logic for caching. |
| **Utilities** | `src/utils/cleanText.js` | Text normalization and cleaning. |

---

## 4. Sources & Technologies Used

### AI Models & APIs
*   **Google Gemini API**: Main AI engine for medical document parsing and vision.
*   **OpenRouter API**: Fallback AI provider (hosting Gemma/Mistral models).

### Infrastructure
*   **BullMQ**: High-performance Node.js message queue based on Redis.
*   **Redis**: In-memory data store used by BullMQ for job management.
*   **Supabase (PostgreSQL)**: Cloud database for structured data storage and caching.

### Libraries
*   **@google/generative-ai**: Official SDK for Gemini.
*   **Tesseract.js**: JavaScript OCR engine for image processing.
*   **pdf-parse**: Library for extracting text from PDF files.
*   **ioredis**: Redis client for Node.js.

---

## 5. Security & Privacy
*   Files are stored temporarily on the server and deleted immediately after processing.
*   AI Prompts are strictly instructed to return structured data without inventing clinical diagnoses.
*   Access to AI results is controlled via Supabase RLS (Row Level Security) and job status tokens.
