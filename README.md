# Travel Assistant

An AI powered travel planning assistant that demonstrates advanced prompt engineering and conversational AI capabilities. Built with a focus on natural, context aware conversations and intelligent travel recommendations.

## Project Overview

The Travel Assistant is a fullStack application that showcases:

- **Advanced Prompt Engineering**: Sophisticated system prompts with CoT reasoning
- **Conversation First Design**: Natural, context aware travel planning conversations
- **External API Integration**: Weather data and country information for enhanced recommendations
- **Intelligent Classification**: LLM based message routing to specialized handlers
- **Error Recovery**: Graceful handling of edge cases and API failures

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm
- Google Gemini API key
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Travel-Assistant
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # In backend directory, create .env file
   cd ../backend
   cp  .env
   ```
   
   Add your API keys to `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   WEATHER_API_KEY=your_weather_api_key
   ```

4. **Start the application**
   ```bash
   # From backend directory
   npm run dev
   ```
   
   This will start both the backend server and frontend development server concurrently.

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Architecture

```
Travel-Assistant/
├── backend/                 # Node.js/Express API server
│   ├── server/
│   │   ├── prompts/        # Advanced prompt templates
│   │   ├── services/       # Core business logic
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API endpoints
│   │   └── middlewares/    # Request processing
│   └── package.json        # Backend dependencies
└── frontend/               # React/Vite web interface
    ├── src/
    │   └── components/     # UI components
    └── package.json        # Frontend dependencies
```

## Features

### Core Capabilities
- **Destination Recommendations**: Intelligent suggestions based on preferences and context
- **Trip Planning**: Multi step planning with logistics and optimization
- **Itinerary Creation**: Detailed day by day activity planning
- **Packing Suggestions**: Weather aware packing lists with cultural considerations
- **Context Management**: Maintains conversation history for natural follow ups

### Technical Highlights
- **LLM Based Classification**: Intelligent message routing using Google Gemini
- **CoT Prompts**: Structured reasoning for better responses
- **External Data Integration**: Weather and country information APIs
- **Error Recovery**: Graceful handling of API failures and edge cases
- **Caching Strategy**: Optimized performance with intelligent caching

## API Usage

The project provides a RESTful API for travel planning conversations:

- Message classification and routing
- Destination recommendations
- Trip planning and itineraries
- Packing suggestions with weather data
- Multi-turn conversation support


## Documentation

- [Backend Documentation](./backend/README.md) - Detailed backend implementation guide
- [Frontend Documentation](./frontend/README.md) - Frontend architecture and components

## Development

### Backend Development
```bash
cd backend
npm run start          # Start with nodemon
npm run dev           # Start both frontend and backend
```

### Frontend Development
```bash
cd frontend
npm run dev           # Start Vite dev server
npm run build         # Build for production
```

## Key Achievements

This project demonstrates advanced LLM integration with:

1. **Sophisticated Prompt Engineering**: 6 specialized prompt templates with chain-of-thought reasoning
2. **Intelligent Conversation Flow**: Context-aware responses with natural follow-up handling
3. **Robust Error Handling**: Graceful degradation and recovery mechanisms
4. **External Data Integration**: Seamless blending of LLM knowledge with real-time data
5. **Modern Tech Stack**: React 19, Vite 7, Express 5, and Google Gemini AI

## License

This project is licensed under the ISC License.

---

**Built with Node.js, Express, React, and Google Gemini AI**
