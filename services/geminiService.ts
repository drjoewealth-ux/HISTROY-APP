import { GoogleGenAI } from "@google/genai";
import type { GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert historian and a gifted storyteller. Your primary task is to research the user's topic and compose a compelling, accurate, and engaging historical narrative that concludes with a positive, insightful lesson.

The story should be concise (around 3-5 paragraphs, plus the lesson), well-structured, and written in a professional yet accessible tone. Imagine you are writing for an educated audience on a platform like a well-regarded blog, LinkedIn, or an online magazine. The goal is to both educate and captivate the reader, leaving them with a valuable takeaway.

Key Guidelines:
- **Story Structure:** Within the main 3-5 paragraphs, seamlessly integrate the following sections to create a comprehensive narrative:
  1.  **Background:** Set the stage. What was the context or situation that led to these events?
  2.  **Key Events:** Describe the main events, actions, or turning points. This is the core of the story.
  3.  **Impact/Legacy:** Explain the consequences and long-term significance of the events. What changed as a result?
- **Narrative Focus:** Do not just list facts. Weave the information into a story with a clear beginning, middle, and end. Find the human element and the driving forces behind the events.
- **Professional but Human Tone:** Maintain a credible and informative voice. The writing should feel authored by a person, not a machine, but avoid overly casual language, slang, or direct address to the reader (e.g., "Hey folks," or "Can you believe..."). The tone should be engaging and authoritative without being dry or academic.
- **Start with a Hook:** Grab the reader's attention from the very first sentence with a surprising fact, a vivid description, or an intriguing question.
- **Conclude with a Positive Lesson:** After the main narrative, add a final paragraph that offers a thoughtful, positive, and insightful lesson that can be learned from the historical event. This should be a reflection on the broader human experience, such as resilience, innovation, or the importance of collaboration.
- **Fact-Based:** The narrative must be strictly based on the information you find using the search tool.
- **Plain Text Only:** The entire response must be plain text. Do NOT use emojis, hashtags (#), or any other special characters or formatting.
`;

const SUGGESTION_SYSTEM_INSTRUCTION = `You are a creative historian. Your task is to suggest a single, interesting, and specific historical topic that would make for a great story.

Rules:
- Respond with ONLY the name of the topic.
- Do not add any introductory text like "Here is a topic:".
- The topic should be concise and intriguing.

Example Response:
The Great Emu War of 1932`;


export const generateStory = async (topic: string): Promise<{ story: string; sources: GroundingChunk[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: topic }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });

    const storyText = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = (groundingMetadata?.groundingChunks || []) as GroundingChunk[];

    if (!storyText) {
        throw new Error("The AI did not write a story. The answer was empty.");
    }
    
    // Clean the story to remove any potential hashtags, asterisks, or emojis, ensuring only plain text is returned.
    const emojiRegex = /\p{Extended_Pictographic}/gu;
    const story = storyText.replace(emojiRegex, '').replace(/[#*]/g, '').trim();


    return { story, sources };
  } catch (error) {
    console.error("Error generating story:", error);
    if (error instanceof Error) {
        throw new Error(`Could not talk to the AI model: ${error.message}`);
    }
    throw new Error("A strange error happened while making the story.");
  }
};

export const suggestTopic = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: 'Suggest a new, interesting historical topic for me to learn about.' }] }],
            config: {
                systemInstruction: SUGGESTION_SYSTEM_INSTRUCTION,
            },
        });

        const suggestion = response.text.trim();
        
        if (!suggestion) {
            throw new Error("The AI did not suggest a topic.");
        }

        // Clean up potential quotes that the model might add
        return suggestion.replace(/["']/g, '');

    } catch (error) {
        console.error("Error suggesting topic:", error);
        if (error instanceof Error) {
            throw new Error(`Could not get a suggestion from the AI model: ${error.message}`);
        }
        throw new Error("A strange error happened while suggesting a topic.");
    }
};

export const generateImage = async (topic: string): Promise<string> => {
  try {
    const prompt = `A hyper-realistic, photorealistic 8k image depicting: ${topic}. The image should be historically accurate with incredible detail, capturing the scene as if it were a real photograph. Dramatic, cinematic lighting. Avoid text, watermarks, and borders.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return base64ImageBytes;
    } else {
      throw new Error("The AI did not generate an image.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      throw new Error(`Could not create an image with the AI model: ${error.message}`);
    }
    throw new Error("A strange error happened while creating the image.");
  }
};