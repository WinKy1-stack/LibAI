/**
 * Chat Response Types - LibAI
 * Structured JSON response schema from Gemini API
 */

// Response types
export type ResponseType = 
  | 'answer'
  | 'book_metadata' 
  | 'recommendation'
  | 'search_results'
  | 'error';

// Book metadata structure
export interface BookMetadata {
  record_id?: string;
  title: string;
  authors: string[];
  isbn?: string;
  publisher?: string;
  year?: number;
  category?: string;
  summary?: string;
  available?: boolean;
  location?: string;
}

// Response payload types
export interface AnswerPayload {
  text: string;
  confidence: number;
}

export interface BookMetadataPayload {
  book: BookMetadata;
  explanation?: string;
}

export interface RecommendationPayload {
  books: BookMetadata[];
  reasoning?: string;
  total_recommended: number;
}

export interface SearchResultPayload {
  query: string;
  items: BookMetadata[];
  total_found: number;
  summary?: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: string;
}

// Response envelope (discriminated union)
export type ResponseEnvelope =
  | {
      version: 'libai.v1';
      type: 'answer';
      timestamp: string;  // ISO 8601 UTC
      trace_id: string;   // UUID for tracing
      payload: AnswerPayload;
    }
  | {
      version: 'libai.v1';
      type: 'book_metadata';
      timestamp: string;
      trace_id: string;
      payload: BookMetadataPayload;
    }
  | {
      version: 'libai.v1';
      type: 'recommendation';
      timestamp: string;
      trace_id: string;
      payload: RecommendationPayload;
    }
  | {
      version: 'libai.v1';
      type: 'search_results';
      timestamp: string;
      trace_id: string;
      payload: SearchResultPayload;
    }
  | {
      version: 'libai.v1';
      type: 'error';
      timestamp: string;
      trace_id: string;
      payload: ErrorPayload;
    };

// API Response wrapper
export interface ChatMessageResponse {
  success: boolean;
  data: {
    response: ResponseEnvelope;
    conversation_id?: string;
    message_id?: string;
    trace_id?: string;  // UUID for request tracing
  };
  metadata?: {
    model: string;
    response_type: ResponseType;
    processing_time?: number;
    trace_id?: string;
  };
}

// Helper type guards
export function isAnswerResponse(envelope: ResponseEnvelope): envelope is Extract<ResponseEnvelope, { type: 'answer' }> {
  return envelope.type === 'answer';
}

export function isBookMetadataResponse(envelope: ResponseEnvelope): envelope is Extract<ResponseEnvelope, { type: 'book_metadata' }> {
  return envelope.type === 'book_metadata';
}

export function isRecommendationResponse(envelope: ResponseEnvelope): envelope is Extract<ResponseEnvelope, { type: 'recommendation' }> {
  return envelope.type === 'recommendation';
}

export function isSearchResultsResponse(envelope: ResponseEnvelope): envelope is Extract<ResponseEnvelope, { type: 'search_results' }> {
  return envelope.type === 'search_results';
}

export function isErrorResponse(envelope: ResponseEnvelope): envelope is Extract<ResponseEnvelope, { type: 'error' }> {
  return envelope.type === 'error';
}
