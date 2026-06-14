import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
const geminiApiKey = process.env.GEMINI_API_KEY;
const qdrantApiKey = process.env.QDRANT_API_KEY;

app.use(cors());
app.use(express.json());

function getQdrantHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (qdrantApiKey) {
    headers['api-key'] = qdrantApiKey;
  }
  return headers;
}

// Simple in-memory cache to store embeddings
const embeddingCache = new Map();

async function getEmbedding(text, apiKey) {
  const cacheKey = text.trim();
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "models/text-embedding-004",
      content: {
        parts: [{ text: text }]
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.embedding || !data.embedding.values) {
    throw new Error("Invalid embedding response structure");
  }

  const embedding = data.embedding.values;
  embeddingCache.set(cacheKey, embedding);
  return embedding;
}



async function initQdrant() {
  try {
    // Check if collection exists
    const res = await fetch(`${qdrantUrl}/collections/courses`, {
      headers: getQdrantHeaders()
    });
    if (res.status === 404) {
      console.log("Creating Qdrant collection 'courses'...");
      const createRes = await fetch(`${qdrantUrl}/collections/courses`, {
        method: 'PUT',
        headers: getQdrantHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          vectors: {
            size: 768, // size for text-embedding-004
            distance: "Cosine"
          }
        })
      });
      if (createRes.ok) {
        console.log("Qdrant collection 'courses' created successfully ✅");
      } else {
        const errText = await createRes.text();
        console.error("❌ Failed to create Qdrant collection:", errText);
      }
    } else if (res.ok) {
      console.log("Qdrant collection 'courses' already exists ✅");
    }
  } catch (err) {
    console.warn("⚠️ Qdrant connection/init failed. Error:", err.message);
  }
}

app.get('/', (req, res) => {
  res.json({ status: "ok", service: "chatbot-service" });
});

app.post('/chatbot/sync-courses', async (req, res) => {
  const { action, course, courseId } = req.body;
  const apiKey = geminiApiKey;

  if (!apiKey) {
    console.warn("⚠️ [Chatbot Service Sync] GEMINI_API_KEY is not configured.");
    return res.status(501).json({ error: "Gemini API key is not configured on the server." });
  }

  try {
    if (action === 'upsert' && course) {
      console.log(`📥 [Chatbot Service] Syncing/Upserting course to Qdrant: ${course.title}`);
      const textToEmbed = `Title: ${course.title}\nDescription: ${course.description || ""}`;
      const courseEmbedding = await getEmbedding(textToEmbed, apiKey);
      
      const point = {
        id: course.id,
        vector: courseEmbedding,
        payload: course
      };

      const upsertRes = await fetch(`${qdrantUrl}/collections/courses/points?wait=true`, {
        method: 'PUT',
        headers: getQdrantHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ points: [point] })
      });

      if (!upsertRes.ok) {
        const errText = await upsertRes.text();
        throw new Error(`Qdrant upsert failed: ${errText}`);
      }
      console.log(`✅ [Chatbot Service] Course synced successfully in Qdrant: ${course.title}`);
    } else if (action === 'delete' && courseId) {
      console.log(`📥 [Chatbot Service] Deleting course from Qdrant: ${courseId}`);
      
      const deleteRes = await fetch(`${qdrantUrl}/collections/courses/points/delete`, {
        method: 'POST',
        headers: getQdrantHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          points: [courseId]
        })
      });

      if (!deleteRes.ok) {
        const errText = await deleteRes.text();
        throw new Error(`Qdrant delete failed: ${errText}`);
      }
      console.log(`✅ [Chatbot Service] Course deleted successfully from Qdrant: ${courseId}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ [Chatbot Service Sync Error]:", error.message);
    res.status(500).json({ error: "Failed to sync course: " + error.message });
  }
});

app.post('/chatbot', async (req, res) => {
  const { message, history, courses } = req.body;
  const apiKey = geminiApiKey || req.headers['x-api-key'];

  if (!apiKey) {
    console.warn("⚠️ [Chatbot Service] GEMINI_API_KEY is not configured.");
    return res.status(501).json({ error: "Gemini API key is not configured on the server." });
  }

  try {
    // 1. Fetch vector embeddings and run similarity matching STRICTLY using Qdrant
    const queryEmbedding = await getEmbedding(message, apiKey);

    let relevantCourses = [];

    if (queryEmbedding) {
      try {
        // Query Qdrant for top 2 similar courses
        const searchRes = await fetch(`${qdrantUrl}/collections/courses/points/search`, {
          method: 'POST',
          headers: getQdrantHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            vector: queryEmbedding,
            limit: 2,
            with_payload: true
          })
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          console.log("🔍 [Chatbot Service Qdrant Vector RAG] Similarity scores:");
          searchData.result.forEach(r => {
            console.log(` - ${r.payload.title}: ${r.score.toFixed(4)}`);
          });
          relevantCourses = searchData.result.map(r => r.payload);
        } else {
          const errText = await searchRes.text();
          console.error("❌ Qdrant search request failed:", errText);
        }
      } catch (err) {
        console.error("❌ [Chatbot Service Qdrant Vector RAG] Failed to query Qdrant:", err.message);
      }
    }

    // Fallback: If Qdrant search returns no matches or fails, use the courses array from frontend
    if (relevantCourses.length === 0 && courses && courses.length > 0) {
      relevantCourses = courses.slice(0, 2);
    }

    // 2. Prepare system instruction with the context (retrieved courses list)
    const systemPrompt = `You are the friendly, helpful AI Assistant for "ChaiCode" (an online coding education platform).

We have the following courses available on our platform:
${courses ? courses.map(c => `- ${c.title}`).join('\n') : 'None'}

Here is the detailed context of the most relevant courses matching the user's query (retrieved via Vector Semantic Search):
${JSON.stringify(relevantCourses || [], null, 2)}

Guidelines:
1. Speak in a friendly, conversational tone. You can use English, Hindi, or a mix of both (Hinglish) based on how the user addresses you.
2. If the user asks about learning a topic or shows interest in a course, explain how our course fits their needs, list its details (like price), and recommend the course.
3. When recommending a course, ALWAYS provide its direct link using this exact path format: [/cohort/<course_id>]. Do NOT use external domain URLs. Example: "You can check it out here: [/cohort/123e4567-e89b-12d3-a456-426614174000]"
4. If the user asks about managing course curriculum or uploading lessons/videos, inform them that instructors can now easily manage their course curriculum by adding sections, deleting sections, adding lessons, deleting lessons, and uploading lesson videos directly to the cloud (using Cloudinary storage) or using video URLs!
5. If a user asks something unrelated to coding, careers, or ChaiCode, politely guide them back: "I am here to help you with ChaiCode courses and programming career guidance!"
6. At the very end of your response, if you recommended any courses, you MUST add a single JSON-like tag list of the course IDs you recommended in this exact format: [RECOMMENDED_IDS: id1, id2]. Example: "[RECOMMENDED_IDS: 123e4567-e89b-12d3-a456-426614174000]". If no courses are recommended, do not add the tag.`;

    // 3. Format chat history for Gemini API
    const formattedContents = [];
    
    // Add history
    if (history && history.length > 0) {
      history.forEach(msg => {
        const role = msg.sender === 'user' ? 'user' : 'model';
        formattedContents.push({
          role: role,
          parts: [{ text: msg.text }]
        });
      });
    }

    // Add current user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // 4. Make HTTP request to Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestPayload = {
      contents: formattedContents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Extract text response
    let responseText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      responseText = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response structure received from Gemini API");
    }

    res.json({ text: responseText });

  } catch (error) {
    console.error("❌ [Chatbot Service Error]:", error.message);
    res.status(500).json({ error: "Failed to communicate with AI model: " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot Service running on port ${PORT}`);
  initQdrant();
});
