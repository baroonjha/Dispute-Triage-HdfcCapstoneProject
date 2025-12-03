# Dispute Triage & Resolution System

# This project is still under development

## 🚀 Project Overview
This project is an intelligent **Dispute Triage and Resolution System** designed to streamline the customer support process for banking and financial services. It leverages **Generative AI (Google Gemini)** and **RAG (Retrieval-Augmented Generation)** to provide instant, accurate answers to customer queries and automate the dispute logging process.

# Note: This project is assuming access to only autherozed company employee and user based on certain specific authentication(RBAC of any company like IAM  group in AWS)

## ❓ The Problem
*   **High Volume**: Support teams are overwhelmed with repetitive queries.
*   **Slow Response**: Manual triage and data entry lead to delayed resolution times.
*   **Inconsistency**: Human agents may provide varying answers to the same policy questions.
*   **Manual Effort**: Extracting dispute details and logging tickets is time-consuming.

## 💡 The Solution
We implemented a **Next.js** web application that combines a customer-facing AI chatbot with an admin dashboard.
*   **Triage_Logic** : Pending
*   **AI Chatbot**: Uses RAG to answer policy questions instantly using uploaded documents.
*   **Automated Triage**: If the user is unhappy, the AI extracts dispute details (Amount, Category, Priority) from the chat history and pre-fills a dispute form.
*   **Admin Dashboard**: A centralized view for agents to manage, filter, and resolve disputes.

## 🛠️ Tech Stack
*   **Frontend & Backend**: [Next.js 15](https://nextjs.org/) (React, TypeScript)
*   **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
*   **AI & LLM**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.0-flash`, `text-embedding-004`)
*   **Vector Database**: [Pinecone](https://www.pinecone.io/) (for RAG context retrieval)
*   **Styling**: Tailwind CSS
*   **PDF Parsing**: `pdf2json`

## 🧠 Approach & RAG Implementation

### Why RAG (Retrieval-Augmented Generation)?
Standard LLMs can hallucinate or lack specific knowledge about your private policies. RAG solves this by:
1.  **Ingesting** your policy documents (PDF/TXT) into a Vector Database (Pinecone).
2.  **Retrieving** the most relevant text chunks when a user asks a question.
3.  **Augmenting** the LLM prompt with this context to generate a factual answer.

**Benefits:**
*   **Reduced Manual Intervention**: The bot handles L1/L2 queries automatically.
*   **Scalability**: Can be trained on any team's data by simply uploading new documents.
*   **Accuracy**: Answers are grounded in your actual policy documents.

### Workflow Architecture

```mermaid
graph TD
    subgraph Frontend
        User[User]
        ChatUI[Chat Interface]
        Dashboard[Admin Dashboard]
    end

    subgraph Backend_API
        ChatAPI[/api/chat]
        IngestAPI[/api/rag-ingest]
        DisputeAPI[/api/disputes]
        ExtractAPI[/api/extract-dispute-details]
    end

    subgraph Data_Layer
        MongoDB[(MongoDB - Disputes)]
        Pinecone[(Pinecone - Vectors)]
    end

    subgraph AI_Engine
        Gemini[Google Gemini LLM]
    end

    %% RAG Flow
    User -->|1. Asks Question| ChatUI
    ChatUI -->|2. Send Message| ChatAPI
    ChatAPI -->|3. Generate Embedding| Gemini
    ChatAPI -->|4. Retrieve Context| Pinecone
    Pinecone -- Relevant Chunks --> ChatAPI
    ChatAPI -->|5. Generate Answer (with Context)| Gemini
    Gemini -- Answer --> ChatAPI
    ChatAPI -->|6. Response| ChatUI

    %% Dispute Flow
    User -->|7. Raise Dispute| ChatUI
    ChatUI -->|8. Request Extraction| ExtractAPI
    ExtractAPI -->|9. Analyze History| Gemini
    Gemini -- Extracted Fields --> ExtractAPI
    ExtractAPI -- JSON Data --> ChatUI
    ChatUI -->|10. Submit Dispute| DisputeAPI
    DisputeAPI -->|11. Save Ticket| MongoDB
    MongoDB -- Updates --> Dashboard
```

## 📂 File Structure

```
├── src/
│   ├── app/
│   │   ├── api/                # Backend API Routes
│   │   │   ├── chat/           # Chatbot logic (RAG + Gemini)
│   │   │   ├── disputes/       # CRUD for Disputes
│   │   │   ├── extract-dispute-details/ # AI Extraction logic
│   │   │   └── rag-ingest/     # Document ingestion (PDF/TXT)
│   │   ├── chatbot/            # Customer Chat Interface
│   │   └── dashboard/          # Admin Dashboard & Knowledge Base
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Utilities (DB connection)
│   └── models/                 # Mongoose Schemas (Dispute.ts)
└── README.md                   # Project documentation
```

## 🚀 Getting Started

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables** (`.env.local`):
    ```env
    MONGODB_URI=your_mongodb_uri
    GEMINI_API_KEY=your_gemini_key
    PINECONE_API_KEY=your_pinecone_key
    PINECONE_INDEX_NAME=your_index_name
    ```
4.  **Run the application**:
    ```bash
    npm run dev
    ```
5.  **Access the App**:
    *   **Web App**: `http://localhost:3000`