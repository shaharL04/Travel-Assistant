# Travel Assistant Backend

A sophisticated travel planning assistant that demonstrates advanced LLM conversation capabilities, prompt engineering, and external data integration.

## Features

### 🗣️ Conversation-First Design
- **Natural Conversation Flow**: Maintains context across multiple interactions
- **Follow-up Question Handling**: Seamlessly handles complex multi-turn conversations
- **Context Management**: Intelligent conversation history with automatic cleanup
- **Session Management**: Persistent conversation sessions with unique IDs

### 🧠 Enhanced Prompt Engineering
- **Chain of Thought Reasoning**: Multi-step reasoning process for complex queries
- **Dynamic Prompt Selection**: Different prompts for different types of requests
- **Context-Aware Responses**: Incorporates conversation history and external data
- **Error Recovery**: Graceful handling of LLM limitations and hallucinations

### 🌐 External Data Integration
- **Weather API**: Real-time weather data for destinations
- **Country Information**: Currency, language, population, and cultural data
- **Travel Restrictions**: Visa requirements, COVID info, and travel advisories
- **Smart Data Blending**: Intelligent decision-making on when to use external vs LLM data

### 🛠️ Technical Implementation
- **Simple Architecture**: Clean, maintainable code structure
- **Caching System**: Efficient data caching for performance
- **Error Handling**: Comprehensive error management and recovery
- **API Documentation**: Well-documented endpoints and responses

## API Endpoints

### Chat Endpoints

#### `POST /chat`
Main conversation endpoint for travel assistance.

**Request Body:**
```json
{
  "message": "I want to visit Paris in spring",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "generated-session-id",
  "message": "LLM response with travel advice",
  "context": {
    "messageCount": 2,
    "usedExternalData": true,
    "destination": "paris",
    "externalData": {
      "weather": { "temperature": 15, "description": "partly cloudy" },
      "country": { "currency": "EUR", "languages": ["French"] }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### `GET /conversation/:sessionId`
Retrieve conversation history for a session.

#### `DELETE /conversation/:sessionId`
Clear conversation history for a session.

### Travel Insights

#### `POST /insights`
Get comprehensive travel insights for a destination.

**Request Body:**
```json
{
  "destination": "tokyo",
  "preferences": {
    "budget": "medium",
    "duration": "1 week",
    "interests": ["culture", "food"]
  }
}
```

### Health Check

#### `GET /health`
Check system health and service status.

## Environment Variables

Create a `.env` file in the backend directory:

### For Google Gemini 2.5 (Recommended)
```env
# Gemini Configuration
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_API_KEY=your_gemini_api_key_here

# External APIs (optional)
WEATHER_API_KEY=your_openweathermap_api_key

# Server Configuration
PORT=3000
```

## Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up LLM Service:**

   **For Google Gemini 2.5 (Recommended):**
   - Sign up for Google AI Studio: https://aistudio.google.com/
   - Get your API key from the dashboard
   - Add your API key to the `.env` file as `GEMINI_API_KEY`

3. **Start the Server:**
   ```bash
   npm start
   ```

## Conversation Examples

### Destination Recommendation
```
User: "I'm looking for a romantic destination in Europe for my anniversary"
Assistant: "For a romantic European anniversary, I'd recommend several wonderful options..."

User: "What about Paris specifically?"
Assistant: "Paris is absolutely perfect for romance! Let me share some specific recommendations..."
```

### Packing Suggestions
```
User: "I'm going to Tokyo in March, what should I pack?"
Assistant: "For Tokyo in March, you'll want to prepare for spring weather..."
```

### Complex Planning
```
User: "I want to plan a 2-week backpacking trip through Europe"
Assistant: "Let me think through this step by step. For a 2-week backpacking trip..."
```

## Prompt Engineering Highlights

### Chain of Thought Reasoning
The system uses structured reasoning for complex queries:

**General Planning (4-step process):**
1. **ANALYZE**: Understand the request and context
2. **CONSIDER**: Think about relevant factors
3. **RESEARCH**: Determine what external data is needed
4. **RECOMMEND**: Provide specific suggestions
5. **EXPLAIN**: Give reasoning for recommendations

**Detailed Itinerary Planning (5-step process):**
1. **UNDERSTAND**: Analyze trip type, duration, and requirements
2. **IDENTIFY**: Evaluate suitable destinations and criteria
3. **STRUCTURE**: Plan daily itinerary breakdown
4. **OPTIMIZE**: Arrange activities logically and efficiently
5. **DETAIL**: Provide practical implementation guidance

### Dynamic Prompt Selection
- **Destination Prompts**: For location-specific queries
- **Planning Prompts**: For complex itinerary planning
- **Itinerary Prompts**: For detailed day-by-day planning
- **Context-Aware**: Incorporates conversation history

### External Data Integration
- **Smart Detection**: Automatically identifies when external data is needed
- **Data Blending**: Seamlessly combines LLM knowledge with real-time data
- **Fallback Handling**: Graceful degradation when APIs are unavailable

## Error Handling

The system includes comprehensive error handling:
- **LLM Failures**: Graceful fallback responses
- **API Timeouts**: Automatic retry with cached data
- **Invalid Inputs**: Clear error messages and suggestions
- **Context Loss**: Automatic session recovery

## Performance Features

- **Caching**: 30-minute cache for external API data
- **Context Management**: Automatic cleanup of old conversations
- **Session Optimization**: Efficient memory usage
- **Response Time**: Optimized for real-time conversation

## Development

### Running in Development Mode
```bash
npm run dev  # Runs both backend and frontend
```

### Testing Endpoints
Use tools like Postman or curl to test the API:

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about Paris"}'

# Test health check
curl http://localhost:3000/health
```

### Testing Prompt System
Test the new prompt management system:

```bash
# Test prompt loading and template building
node test-prompts.js

# Test chain-of-thought reasoning
node test-chain-of-thought.js

# Test Gemini integration
node test-gemini.js

# Test core functionality
node test.js
```

## Architecture

```
backend/
├── server/
│   ├── controllers/
│   │   └── chatController.js          # Main request handling
│   ├── services/
│   │   ├── llmService.js              # LLM integration
│   │   ├── apiService.js              # External API integration
│   │   └── promptManager.js           # Prompt template management
│   ├── prompts/                       # Prompt templates (markdown files)
│   │   ├── README.md                  # Prompt documentation
│   │   ├── system-prompt.md           # Main system prompt
│   │   ├── destination-prompt.md      # Destination recommendations
│   │   ├── planning-prompt.md         # Complex planning with chain of thought
│   │   ├── packing-prompt.md          # Packing suggestions
│   │   └── error-recovery-prompt.md   # Error handling
│   ├── routes/
│   │   └── index.js                   # API endpoints
│   ├── middlewares/
│   │   └── corsMiddleware.js          # CORS handling
│   └── index.js                       # Server entry point
├── package.json
├── README.md
├── GEMINI_SETUP.md
├── SAMPLE_CONVERSATIONS.md
├── PROMPT_ENGINEERING_NOTES.md
├── test.js                           # Core functionality tests
├── test-prompts.js                   # Prompt system tests
├── test-chain-of-thought.js          # Chain-of-thought reasoning tests
└── test-gemini.js                    # Gemini integration tests
```

## Contributing

1. Follow the existing code structure
2. Add comprehensive error handling
3. Update documentation for new features
4. Test with various conversation scenarios

## License

ISC License