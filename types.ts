
export interface WebChunk {
  uri: string;
  title: string;
}

// This structure matches groundingChunks from the Gemini API response
export interface GroundingChunk {
  web: WebChunk;
}
