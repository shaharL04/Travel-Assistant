# Travel Request Classification Prompt

## CRITICAL INSTRUCTIONS
You MUST use the `analyze_travel_request` function to classify this travel request. DO NOT respond with text - ONLY call the function.

## FUNCTION CALLING REQUIREMENT
**MANDATORY**: You MUST call `analyze_travel_request` with the exact parameters shown below. This is NOT optional.

## USER MESSAGE TO ANALYZE
{{userMessage}}

## FUNCTION PARAMETERS TO USE
```json
{
  "category": "destination|planning|itinerary|packing|general",
  "city": "extracted city name or empty string",
  "country": "extracted country name or empty string", 
  "function_to_call": "get_weather|get_country_info|none",
  "function_args": {
    "city": "city name for weather API (or empty string)",
    "country": "country name for country API (or empty string)"
  }
}
```

## EXTRACTION REQUIREMENTS
**EXTRACT EVERYTHING POSSIBLE** from the user message:
- **ALWAYS try to extract city names** - look for any mention of cities, towns, or specific locations
- **ALWAYS try to extract country names** - even if implied or mentioned indirectly
- **Look for abbreviations** (NYC = New York City, UK = United Kingdom)
- **Consider context clues** (Eiffel Tower → Paris, France)
- **Extract from partial names** (Tokyo → Japan, Rome → Italy)
- **Look for regional references** (Tuscany → Italy, Provence → France)

## CLASSIFICATION RULES
- **destination**: Questions about where to go, destination recommendations
- **planning**: Questions about how to plan trips, logistics, strategy
- **itinerary**: Questions about daily schedules, what to do each day
- **packing**: Questions about what to bring, packing lists
- **general**: Fallback for unclear requests

## FUNCTION CALLING RULES
- **get_weather**: Use when user asks about weather, climate, or weather-dependent planning
- **get_country_info**: Use when user asks about country facts, culture, or country-specific info
- **none**: Use when no external data is needed

## EXAMPLES
**User**: "What's the weather like in Paris?"
**Function Call**: `analyze_travel_request` with `{"category": "destination", "city": "Paris", "country": "France", "function_to_call": "get_weather", "function_args": {"city": "Paris", "country": "France"}}`

**User**: "Tell me about Japan"
**Function Call**: `analyze_travel_request` with `{"category": "destination", "city": "", "country": "Japan", "function_to_call": "get_country_info", "function_args": {"city": "", "country": "Japan"}}`

**User**: "How do I plan a trip to Italy?"
**Function Call**: `analyze_travel_request` with `{"category": "planning", "city": "", "country": "Italy", "function_to_call": "none", "function_args": {"city": "", "country": "Italy"}}`

**User**: "I want to visit NYC and then go to London"
**Function Call**: `analyze_travel_request` with `{"category": "planning", "city": "NYC", "country": "United States", "function_to_call": "none", "function_args": {"city": "NYC", "country": "United States"}}`

## REMINDER
**DO NOT RESPOND WITH TEXT**. You MUST call the `analyze_travel_request` function. This is the ONLY acceptable response format.

**EXTRACTION PRIORITY**: Fill every field you can with reasonable confidence. If you're unsure, use empty strings rather than guessing. Better to extract nothing than to extract incorrectly.