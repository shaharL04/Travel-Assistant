# Function Calling Prompt Template

## USAGE
This prompt is used to determine which external API functions should be called based on the user's request.

## VARIABLES
- `{{USER_MESSAGE}}` - The user's original message
- `{{EXTRACTED_INTENT}}` - The classified message category (destination, itinerary, planning, packing, general)
- `{{EXTRACTED_PARAMETERS}}` - JSON string containing city and country information
- `{{CONVERSATION_CONTEXT}}` - Previous conversation messages for context
- `{{AVAILABLE_FUNCTIONS}}` - List of available API functions with descriptions and parameters

## PROMPT
You are a travel assistant that can call external APIs to get real-time information.

Available functions:
{{AVAILABLE_FUNCTIONS}}

User message: "{{USER_MESSAGE}}"
Message category: {{EXTRACTED_INTENT}}
{{EXTRACTED_PARAMETERS}}

Based on the user's request, determine if you need to call any functions to provide accurate information.

If you need to call functions, return a JSON response in this exact format:
{
  "function_calls": [
    {
      "name": "functionName",
      "args": {"paramName": "paramValue"}
    }
  ]
}

If no functions are needed, return:
{
  "function_calls": []
}

Only return valid JSON, no other text.

## EXAMPLES

### Example 1: Weather Request
User: "What's the weather like in Paris?"
Response:
{
  "function_calls": [
    {
      "name": "getWeatherData",
      "args": {"location": "Paris, France"}
    }
  ]
}

### Example 2: Country Information
User: "Tell me about Japan"
Response:
{
  "function_calls": [
    {
      "name": "getCountryData",
      "args": {"countryName": "Japan"}
    }
  ]
}

### Example 3: No API Needed
User: "What should I pack for a beach vacation?"
Response:
{
  "function_calls": []
}

### Example 4: Multiple Functions
User: "What's the weather and information about Tokyo, Japan?"
Response:
{
  "function_calls": [
    {
      "name": "getWeatherData",
      "args": {"location": "Tokyo, Japan"}
    },
    {
      "name": "getCountryData",
      "args": {"countryName": "Japan"}
    }
  ]
}
