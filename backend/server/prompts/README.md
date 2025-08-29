# Travel Assistant Prompts

This folder contains all the prompt templates used by the Travel Assistant backend. Each prompt is organized in a separate markdown file for better readability, maintainability, and version control.

## 📁 File Structure

```
prompts/
├── README.md                    # This file - overview and usage guide
├── system-prompt.md            # Main TravelGPT system prompt
├── classification-prompt.md    # LLM-based message classification
├── destination-prompt.md       # Destination recommendation template
├── planning-prompt.md          # Complex planning with chain of thought
├── itinerary-prompt.md         # Detailed day-by-day itinerary planning
├── packing-prompt.md           # Packing suggestions with weather integration
└── error-recovery-prompt.md    # Error handling and clarification
```

## 🎯 Prompt Categories

### 1. **System Prompt** (`system-prompt.md`)
- **Purpose**: Defines the TravelGPT persona and core capabilities
- **Usage**: Base prompt for all interactions
- **Key Features**: 
  - Clear role definition
  - Conversation guidelines
  - Chain of thought framework
  - Error handling instructions

### 2. **Classification Prompt** (`classification-prompt.md`)
- **Purpose**: Intelligently classify user messages into appropriate categories
- **Usage**: Route messages to the most suitable specialized prompt
- **Key Features**:
  - LLM-based classification (5 categories)
  - Context-aware decision making
  - Fallback to keyword-based classification
  - Intelligent prompt routing

### 3. **Destination Prompt** (`destination-prompt.md`)
- **Purpose**: Location-specific recommendations and advice
- **Usage**: General travel queries, destination suggestions
- **Key Features**:
  - Chain-of-thought reasoning (4-step analysis)
  - Context-aware responses
  - External data integration
  - Follow-up questions

### 4. **Planning Prompt** (`planning-prompt.md`)
- **Purpose**: Complex trip planning with structured reasoning
- **Usage**: Multi-city trips, itineraries, logistics
- **Key Features**:
  - Chain of thought analysis
  - Step-by-step reasoning
  - Comprehensive planning approach

### 5. **Itinerary Prompt** (`itinerary-prompt.md`)
- **Purpose**: Detailed day-by-day itinerary planning
- **Usage**: Specific duration trips, daily schedules, activity planning
- **Key Features**:
  - 5-step chain of thought analysis
  - Daily breakdown structure
  - Time-based activity planning
  - Practical implementation details

### 6. **Packing Prompt** (`packing-prompt.md`)
- **Purpose**: Weather-aware packing recommendations
- **Usage**: Packing lists, clothing advice, cultural considerations
- **Key Features**:
  - Chain-of-thought reasoning (5-step analysis)
  - Weather data integration
  - Cultural appropriateness
  - Activity-based suggestions

### 7. **Error Recovery Prompt** (`error-recovery-prompt.md`)
- **Purpose**: Handle ambiguous requests and errors gracefully
- **Usage**: Clarification scenarios, API failures, user confusion
- **Key Features**:
  - Chain-of-thought reasoning (4-step analysis)
  - Clarifying questions
  - Alternative suggestions
  - Graceful degradation

## 🔧 Usage in Code

### Loading Prompts
```javascript
import fs from 'fs';
import path from 'path';

class PromptManager {
    constructor() {
        this.promptsPath = path.join(__dirname, 'prompts');
    }

    async loadPrompt(filename) {
        const filePath = path.join(this.promptsPath, filename);
        return await fs.promises.readFile(filePath, 'utf8');
    }

    async getSystemPrompt() {
        return await this.loadPrompt('system-prompt.md');
    }

    async getClassificationPrompt() {
        return await this.loadPrompt('classification-prompt.md');
    }

    async getDestinationPrompt() {
        return await this.loadPrompt('destination-prompt.md');
    }

    // ... other prompt loading methods
}
```

### Template Variable Replacement
```javascript
function replaceTemplateVariables(template, variables) {
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return result;
}

// Usage example
const prompt = await promptManager.getDestinationPrompt();
const filledPrompt = replaceTemplateVariables(prompt, {
    SYSTEM_PROMPT: systemPrompt,
    CONVERSATION_HISTORY: context,
    USER_MESSAGE: userMessage,
    EXTERNAL_DATA_JSON: JSON.stringify(externalData)
});
```

## 📝 Template Variables

### Common Variables
- `{{SYSTEM_PROMPT}}`: The main TravelGPT system prompt
- `{{USER_MESSAGE}}`: The current user's request
- `{{CONVERSATION_HISTORY}}`: Previous messages in the conversation
- `{{EXTERNAL_DATA_JSON}}`: Weather, country, or travel data

### Classification Variables
- `{{USER_MESSAGE}}`: The user message to classify
- `{{CONVERSATION_CONTEXT}}`: Conversation history for context-aware classification

### Specialized Variables
- `{{WEATHER_DATA_JSON}}`: Weather conditions and forecast
- `{{DESTINATION_DATA_JSON}}`: Cultural and practical destination info
- `{{CONTEXT_INFO}}`: Error context or additional information

## 🎨 Prompt Design Principles

### 1. **Chain-of-Thought Reasoning**
- **All prompts** include structured multi-step reasoning processes
- **Destination Prompt**: 4-step analysis (Analyze → Evaluate → Formulate → Provide)
- **Planning Prompt**: 4-step analysis (Analyze → Consider → Formulate → Provide)
- **Itinerary Prompt**: 5-step analysis (Understand → Identify → Plan → Optimize → Provide)
- **Packing Prompt**: 5-step analysis (Analyze → Evaluate → Determine → Formulate → Provide)
- **Error Recovery Prompt**: 4-step analysis (Analyze → Identify → Formulate → Provide)
- **Benefits**: Improved reasoning, better explanations, more accurate responses

### 2. **Modularity**
- Each prompt has a specific purpose
- Easy to modify individual components
- Clear separation of concerns

### 3. **Readability**
- Markdown format for easy reading
- Clear structure and organization
- Comprehensive documentation

### 4. **Maintainability**
- Version control friendly
- Easy to update and improve
- Clear variable definitions

### 5. **Flexibility**
- Template-based approach
- Dynamic variable replacement
- Context-aware responses

## 🔄 Updating Prompts

### Best Practices
1. **Test Changes**: Always test prompt modifications
2. **Version Control**: Commit prompt changes separately
3. **Documentation**: Update this README when adding new prompts
4. **Backup**: Keep backups of working prompts

### Adding New Prompts
1. Create a new `.md` file in this folder
2. Follow the established template structure
3. Document the purpose and variables
4. Update this README with the new prompt
5. Test the prompt thoroughly

## 📊 Performance Considerations

### Prompt Optimization
- Keep prompts concise but comprehensive
- Use clear, specific instructions
- Minimize redundant information
- Optimize for the target LLM

### Caching Strategy
- Cache loaded prompts in memory
- Implement prompt versioning
- Monitor prompt performance
- A/B test prompt variations

## 🧪 Testing Prompts

### Test Scenarios
- **Normal Usage**: Standard travel queries
- **Edge Cases**: Ambiguous or complex requests
- **Error Conditions**: API failures and limitations
- **Context Maintenance**: Multi-turn conversations

### Quality Metrics
- Response relevance and accuracy
- Conversation flow and naturalness
- Error handling effectiveness
- User satisfaction and clarity

---

**Note**: These prompts are designed to work with the Travel Assistant backend and are optimized for Google Gemini 2.5 and other LLM APIs. Regular updates and improvements are made based on user feedback and performance analysis.
