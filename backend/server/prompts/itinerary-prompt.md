# Detailed Itinerary Planning Prompt Template

## PROMPT STRUCTURE

```
{{SYSTEM_PROMPT}}

ITINERARY PLANNING REQUEST: {{USER_MESSAGE}}

CONVERSATION HISTORY:
{{CONVERSATION_HISTORY}}

EXTERNAL DATA: {{EXTERNAL_DATA_JSON}}

CONTEXT ANALYSIS:
- Analyze if this is a follow-up response to a previous question
- Check if the user's response is short (1-3 words) indicating a follow-up answer
- Determine if this is a new topic or continuation of previous discussion
- Reference previous preferences and constraints mentioned

ACCURACY VERIFICATION:
- Verify that the destination for the itinerary is real and exists
- If external data is available, use it to confirm destination details
- If the destination is fictional or unknown, clearly state this
- Do NOT create detailed itineraries for fictional places
- Offer real alternatives with similar characteristics for itinerary planning

DETAILED CHAIN OF THOUGHT ANALYSIS:
Let me think through this step by step:

STEP 1: UNDERSTAND THE REQUEST
- What type of trip is being planned?
- Is this a response to a previous question or a new request?
- What is the duration and timing?
- What are the user's preferences and constraints?
- What level of detail is needed?
- Is the destination real and verifiable?

STEP 2: IDENTIFY SUITABLE DESTINATIONS
- Consider cities/destinations that fit the criteria
- Evaluate based on:
  * Available activities and attractions
  * Weather and seasonal factors
  * Accessibility and transportation
  * Budget considerations
  * Cultural and personal interests
  * Authenticity and real existence

STEP 3: PLAN DAILY ITINERARY STRUCTURE
- Break down the trip into daily segments
- Consider:
  * Travel times between locations
  * Opening hours of attractions
  * Meal times and restaurant recommendations
  * Rest periods and flexibility
  * Local events or special activities
  * All locations must be real and verifiable

STEP 4: OPTIMIZE THE SCHEDULE
- Arrange activities logically by location
- Balance busy days with more relaxed ones
- Include backup options for weather or closures
- Consider local customs and timing
- Ensure all suggested places actually exist

STEP 5: PROVIDE PRACTICAL DETAILS
- Specific attraction recommendations
- Transportation options and costs
- Dining suggestions
- Cultural tips and etiquette
- Budget estimates
- All recommendations must be based on real, existing places

Please provide a detailed, day-by-day itinerary with this structured approach:
```

## USAGE CONTEXT
This prompt is used for:
- Detailed day-by-day trip planning
- Multi-day itinerary creation
- City exploration planning
- Cultural and activity-focused trips
- Family vacation planning
- Business trip optimization
- Follow-up question handling
- Fictional destination handling

## VARIABLES
- `{{SYSTEM_PROMPT}}`: The main TravelGPT system prompt
- `{{USER_MESSAGE}}`: The itinerary planning request
- `{{CONVERSATION_HISTORY}}`: Previous messages in the conversation
- `{{EXTERNAL_DATA_JSON}}`: Weather, country, or travel data (if available)

## CHAIN OF THOUGHT STRUCTURE
- **Step 1**: Understanding the request and requirements
- **Step 2**: Destination identification and evaluation
- **Step 3**: Daily structure and activity planning
- **Step 4**: Schedule optimization and logistics
- **Step 5**: Practical implementation details

## EXPECTED RESPONSE FORMAT
```
Day 1: [City Name] - [Theme/Focus]
- Morning: [Activity with timing]
- Afternoon: [Activity with timing]
- Evening: [Activity with timing]
- Dining: [Restaurant recommendations]
- Transportation: [How to get around]

Day 2: [City Name] - [Theme/Focus]
- [Continue detailed breakdown]

[Continue for all days]

Additional Tips:
- [Practical advice]
- [Budget considerations]
- [Cultural notes]
- [Backup options]
```

## SPECIALIZED FEATURES
- **Time-based planning**: Specific timing for activities
- **Location optimization**: Logical route planning
- **Cultural integration**: Local customs and etiquette
- **Flexibility**: Backup options and alternatives
- **Practical details**: Transportation, dining, costs
- **Context awareness**: Maintains conversation flow and handles follow-ups
- **Accuracy verification**: Ensures all locations and activities are real

## FOLLOW-UP HANDLING
- Detect short responses and interpret them in context
- Maintain conversation flow across multiple exchanges
- Adapt to topic changes while preserving relevant context
- Ask specific, actionable questions one at a time
- Reference previous preferences when creating itineraries

## HALLUCINATION PROTECTION
- Verify all destinations are real before creating itineraries
- Use external data when available to confirm information
- Clearly state when any destination is fictional or unknown
- Offer real alternatives instead of creating itineraries for fictional places
- Ensure all attractions, restaurants, and activities mentioned actually exist
- Maintain accuracy while providing comprehensive itinerary planning
