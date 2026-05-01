# Built for HackerRank Orchestrate Hackathon

---

> Most AI systems try to answer everything.
> This one knows when **not to answer**.

---

## ⚡ What is this?

A **multi-domain AI support agent** that reads real support tickets and decides:

* ✔️ Should I answer this?
* ⚠️ Or escalate to a human?

It works across:

🟢 HackerRank
🟣 Claude
🔵 Visa

And it does something most AI systems fail at:

> It refuses to hallucinate.

---

## 🎯 The Challenge

In the **HackerRank Orchestrate Hackathon**, the goal was simple on paper:

> Build an AI agent that handles support tickets.

But the real problem was deeper:

* ❌ AI makes things up
* ❌ AI answers when it shouldn’t
* ❌ AI ignores risk and sensitivity

So the real question became:

> Can an AI system **decide responsibly**, not just respond?

---

## 🚀 The Idea

Instead of building a chatbot…

I built a **decision system**.

---

## 🔄 How it actually works

```
Ticket → Understand → Retrieve → Decide → Respond or Escalate
```

---

## 🧩 The Brain (Pipeline)

### 1. 🧠 Classifier

Understands what the user wants:

* bug?
* feature request?
* general help?

---

### 2. 🔍 Retriever

Searches only **trusted support documents**

No internet.
No guessing.

---

### 3. ⚖️ Decision Engine (Most Important)

This is where things change.

The system asks:

* Is this sensitive?
* Do I have enough information?
* Am I confident?

If not → **Escalate**

---

### 4. ✍️ Response Generator

If safe:

* builds answer from real docs
* no hallucination
* no assumptions

---

## 💥 The Key Principle

> Wrong answer is worse than no answer.

So the system prefers:

🟡 Escalation over uncertainty
🟢 Accuracy over completeness

---

## 📊 Real Behavior

| Input                      | Output                   |
| -------------------------- | ------------------------ |
| "How do I reset password?" | ✅ Answered               |
| "My Visa card was stolen"  | 🚨 Escalated             |
| "Payment failed"           | ⚖️ Depends on confidence |
| "asdf random text"         | 🚨 Escalated             |

---

## 🧠 What makes this different?

### 🔒 Grounded AI

Every response comes from:

* real documentation
* retrieved context

---

### ⚠️ Safety-first design

Escalates when:

* fraud / billing / account issues
* low confidence retrieval
* unclear intent

---

### ⚡ Lightweight but powerful

* ~6,700 document chunks
* in-memory semantic search
* no heavy infrastructure

---

### 🎯 Deterministic LLM usage

* Groq LLaMA models
* temperature = 0
* strict structured outputs

---

## 🏗️ Architecture

```
main.py
│
├── classifier.py
├── retriever.py
├── indexer.py
├── risk_evaluator.py
├── response_generator.py
└── llm_client.py
```

Each module does **one job only**.
That’s why the system is stable.

---

## 🛠️ Tech Stack

* 🧠 Groq (LLaMA 3.3 70B)
* 🔍 sentence-transformers (MiniLM)
* ⚡ NumPy (fast similarity search)
* 🐍 Python

---

## ⚙️ Run it

```bash
pip install -r requirements.txt
export GROQ_API_KEY=your_key
python code/main.py
```

---

## 📂 Input / Output

Input:

```
support_tickets.csv
```

Output:

```
output.csv
```

Columns:

* response
* status (replied / escalated)
* product_area
* request_type
* justification

---

## 🧪 What I focused on

Not:

* fancy UI
* complex frameworks

But:

* decision accuracy
* safety
* grounding

---

## 🔥 Biggest Insight

The hardest part wasn’t answering.

It was deciding:

> “Should I answer at all?”

---

## 🚧 If I had more time

* smarter table parsing (Visa data)
* deeper semantic grounding checks
* response caching
* better multi-intent handling

---

## 🧑‍💻 Built with

* Antigravity (VIBE coding)
* Groq LLMs
* Structured reasoning

---

## 🏁 Final Thought

Most AI systems try to be helpful.

This one tries to be **correct**.

---
