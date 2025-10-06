const API_BASE = "http://127.0.0.1:8000"; // backend URL

// send text to backend
export async function analyzeText(userMessage) {
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: userMessage }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json(); // { companion, mood, crisis }
  } catch (err) {
    console.error("API error:", err);
    return { error: err.message };
  }
}
