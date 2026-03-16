# MAIA - Maternal Artificial Intelligence Assistant

MAIA is a real-time AI doula designed to support mothers before, during, and after pregnancy through conversational AI, symptom awareness, and maternal education.

[![Live Demo](https://img.shields.io/badge/Live-Demo-000000?style=for-the-badge&logo=vercel&logoColor=3B82F6)](maternal-ai-assistant.vercel.app)

## Project Overview

MAIA serves as a supportive, always-available companion for expecting and new mothers. By combining voice-activated AI with practical tools for health tracking, MAIA addresses the gap in continuous maternal support. The assistant provides evidence-based guidance, emotional support, and critical health awareness, helping to empower mothers in their healthcare journey.

## Problem Statement

Maternal healthcare faces significant challenges, including limited access to doula support, racial disparities in health outcomes, and a lack of immediate, reliable guidance for pregnancy concerns. Many mothers experience anxiety and uncertainty between medical appointments. MAIA aims to bridge this gap by providing accessible, 24/7 support and advocacy tools to improve maternal health outcomes.

## Key Features

*   **AI Doula Assistant:** A conversational AI that provides empathetic support, education, and answers to pregnancy-related questions.
*   **Voice Interaction:** Hands-free interaction using browser-based speech recognition and synthesis, allowing mothers to get help even when they cannot type.
*   **Symptom Guidance:** Tools to assess symptoms and receive recommendations on when to seek medical care (e.g., distinguishing between labor and Braxton Hicks).
*   **Contraction Tracking:** A dedicated labor tracker to time contractions and monitor labor progression (5-1-1 rule guidance).
*   **Postpartum Support:** Resources and guidance for recovery, breastfeeding, and mental health.
*   **Breathing Guidance:** Visual and audio breathing exercises to help manage stress and labor pain.
*   **Camera-Based Input:** (Prototype) Capability to scan documents or visual symptoms for AI analysis.
*   **Advocacy Tools:** Resources to help mothers advocate for their needs in medical settings.

## Tech Stack

### Frontend
*   **React:** UI library for building the interface.
*   **Vite:** Fast build tool and development server.
*   **TailwindCSS:** Utility-first CSS framework for styling.
*   **Framer Motion:** For smooth animations and transitions.
*   **Radix UI:** Accessible component primitives.

### AI Layer
*   **Groq API:** Powers the conversational intelligence using high-speed inference.
*   **Llama Model:** The underlying Large Language Model (Llama 3.1 8B Instant) running via Groq for responsive, natural dialogue.

### Voice Layer
*   **Web Speech API:**
    *   `SpeechRecognition`: Captures user voice input directly in the browser.
    *   `SpeechSynthesis`: Provides text-to-speech responses for the AI.

### State / Storage
*   **LocalStorage:** Used for persisting user profile data, contacts, contraction logs, and symptom history locally on the device (prototype phase).

## Architecture Overview

1.  **User Interface (React):** The user interacts with the app via text or voice.
2.  **Voice/Text Input:** 
    *   Voice input is converted to text using the browser's `SpeechRecognition` API.
    *   Text input is captured directly from form fields.
3.  **AI Processing (Groq API):**
    *   The user's query and conversation history are sent to the Groq API.
    *   A system prompt defines MAIA's persona (supportive doula) and safety guardrails.
4.  **Response Generation:** The Llama model generates a concise, empathetic response.
5.  **Output:**
    *   The text response is displayed in the chat interface.
    *   The browser's `SpeechSynthesis` API reads the response aloud to the user.

## Project Structure

*   `src/components`: Reusable UI components (buttons, inputs, voice orb, etc.).
*   `src/pages`: Main application views (Dashboard, VoiceAssistant, LaborTracker, etc.).
*   `src/lib`: Core logic, including the Groq API client (`app-client.js`) and storage utilities.
*   `src/hooks`: Custom React hooks (e.g., for mobile detection).
*   `src/utils`: Helper functions.

## Setup Instructions

Follow these steps to run MAIA locally:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd MAIA
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add your Groq API key:
    ```env
    VITE_GROQ_API_KEY=your_groq_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the application:**
    Visit `http://localhost:5173` in your browser.

## Demo Features to Try

*   **Ask MAIA about symptoms:** Try asking, "I have a headache and swollen feet, is this normal?" to see the safety guardrails in action.
*   **Use the Voice Assistant:** Click the microphone icon or the "Voice Assistant" card to talk to MAIA hands-free.
*   **Test Contraction Tracking:** Go to the "Labor Tracker" and simulate timing a few contractions.
*   **Explore Breathing:** Use the "Breathing" tool to follow a guided relaxation exercise.
*   **Emergency Contacts:** Add a contact in the "Contacts" section to see how the app helps organize support networks.

## Team Members

*   **Ahtasham Ul Haq** - [LinkedIn](https://www.linkedin.com/in/mr-ahtasham-ul-haq/)
*   **Andrea Scales** - [LinkedIn](https://www.linkedin.com/in/andreascales/)
*   **Agrika Gupta** - [LinkedIn](https://www.linkedin.com/in/agrika-gupta/)

## Acknowledgements

This project was built during the **Gemini Live Agent Challenge** hackathon as a prototype AI maternal support assistant. It demonstrates the potential of low-latency AI agents in providing accessible healthcare support.
