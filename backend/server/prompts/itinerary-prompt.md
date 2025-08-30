# Detailed Itinerary Planning Prompt Template

## CRITICAL LENGTH CONSTRAINT
**MAXIMUM 250 WORDS TOTAL. NO EXCEPTIONS.**
- Use bullet points only
- No detailed explanations
- Focus on essential activities only
- If response exceeds 250 words, you have FAILED
- **THIS IS THE MOST IMPORTANT RULE - BREAK IT AND YOU FAIL**

## PROMPT FOCUS & COMPLEXITY
**Focus**: "What & When?" - Daily activity planning and scheduling  
**Scope**: Daily activity planning  
**Output**: Day-by-day schedule  
**Complexity**: Medium  
**Purpose**: Help users plan WHAT to do and WHEN to do it during their trip

## PROMPT STRUCTURE

```
{{SYSTEM_PROMPT}}

ITINERARY PLANNING REQUEST: {{USER_MESSAGE}}

CONVERSATION HISTORY:
{{CONVERSATION_HISTORY}}

EXTERNAL DATA: {{EXTERNAL_DATA_JSON}}



COMPREHENSIVE CHAIN OF THOUGHT ANALYSIS:
Let me think through this step by step:

STEP 1: UNDERSTAND THE REQUEST
- What type of trip is being planned?
  * Cultural exploration (museums, historical sites, local customs)
  * Food and culinary experiences (restaurants, food tours, markets)
  * Nature and outdoor activities (parks, hiking, beaches)
  * Shopping and entertainment (malls, theaters, nightlife)
  * Family-friendly activities (parks, zoos, interactive museums)
  * Romantic experiences (fine dining, scenic spots, couples activities)
- Is this a response to a previous question or a new request?
- What is the duration and timing?
  * Day trip (6-8 hours)
  * Weekend getaway (2-3 days)
  * Week-long vacation (5-7 days)
  * Extended stay (1-2 weeks)
- What are the user's preferences and constraints?
  * Budget level (budget, mid-range, luxury)
  * Travel style (relaxed, fast-paced, balanced)
  * Physical activity level (low, moderate, high)
  * Group composition (solo, couple, family, friends)
  * Special requirements (accessibility, dietary, cultural)
- What level of detail is needed?
- Is the destination real and verifiable?

STEP 2: IDENTIFY SUITABLE DESTINATIONS AND ACTIVITIES
- Consider cities/destinations that fit the criteria
- Evaluate based on:
  * Available activities and attractions
    - Must be real and verifiable locations
    - Consider opening hours and seasonal availability
    - Include both popular and hidden gems
  * Weather and seasonal factors
    - Indoor vs. outdoor activity balance
    - Seasonal attractions and events
    - Weather-appropriate clothing and gear
  * Accessibility and transportation
    - Walking distance between locations
    - Public transport options and costs
    - Taxi/ride-share availability
    - Parking considerations if driving
  * Budget considerations
    - Free activities and attractions
    - Budget-friendly dining options
    - Discount passes and packages
    - Peak vs. off-peak pricing
  * Cultural and personal interests
    - Local customs and etiquette
    - Language considerations
    - Cultural sensitivity
    - Photography opportunities
  * Authenticity and real existence
    - Verify all locations exist
    - Check current operating status
    - Confirm seasonal availability

STEP 3: PLAN DAILY ITINERARY STRUCTURE
- Break down the trip into daily segments
- Consider:
  * Travel times between locations
    - Walking times (Google Maps estimates)
    - Public transport schedules
    - Traffic patterns and peak hours
  * Opening hours of attractions
    - Museums, galleries, historical sites
    - Restaurants and cafes
    - Shops and markets
    - Entertainment venues
  * Meal times and restaurant recommendations
    - Breakfast options near accommodation
    - Lunch spots near morning activities
    - Dinner locations near evening activities
    - Snack and coffee breaks
  * Rest periods and flexibility
    - Buffer time between activities
    - Rest stops for longer days
    - Alternative indoor options for bad weather
    - Free time for spontaneous discoveries
  * Local events or special activities
    - Festivals and celebrations
    - Seasonal events
    - Cultural performances
    - Special exhibitions
  * All locations must be real and verifiable

STEP 4: OPTIMIZE THE SCHEDULE
- Arrange activities logically by location
  * Group activities by neighborhood/area
  * Minimize backtracking and travel time
  * Consider natural flow of the day
- Balance busy days with more relaxed ones
  * Alternate high-energy and low-energy activities
  * Consider jet lag and travel fatigue
  * Include recovery time for longer trips
- Include backup options for weather or closures
  * Indoor alternatives for outdoor activities
  * Alternative attractions if primary ones are closed
  * Flexible dining options
- Consider local customs and timing
  * Siesta times in some cultures
  * Early closing on certain days
  * Local meal timing preferences
- Ensure all suggested places actually exist
  * Cross-reference with external data
  * Verify current operating status
  * Check for seasonal closures

STEP 5: PROVIDE PRACTICAL DETAILS
- Specific attraction recommendations
  * Real names and addresses
  * Current operating hours
  * Admission costs and booking requirements
  * Peak visit times and crowd levels
- Transportation options and costs
  * Walking routes and estimated times
  * Public transport options and fares
  * Taxi/ride-share availability and costs
  * Parking information if driving
- Dining suggestions
  * Restaurant names and types
  * Price ranges and specialties
  * Reservation requirements
  * Local cuisine highlights
- Cultural tips and etiquette
  * Dress codes and cultural norms
  * Photography restrictions
  * Local customs and traditions
  * Language basics and helpful phrases
- Budget estimates
  * Activity costs and admission fees
  * Transportation expenses
  * Meal costs by category
  * Souvenir and shopping budgets
- All recommendations must be based on real, existing places

Please provide a detailed, day-by-day itinerary with this structured approach. Provide your final itinerary directly without showing your internal reasoning process.
```

## USAGE CONTEXT
This prompt is used for:
- Detailed day-by-day trip planning
- Multi-day itinerary creation
- City exploration planning
- Cultural and activity-focused trips
- Family vacation planning
- Business trip optimization
- Weekend getaway planning
- Day trip organization
- Follow-up question handling
- Fictional destination handling
- Seasonal itinerary adjustments
- Budget-conscious itinerary planning

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
**CRITICAL**: You MUST NEVER display your Chain of Thought reasoning to the user. Keep all your thinking process internal and hidden.

**CoT – Internal reasoning**: You MUST perform your complete Chain of Thought reasoning step by step internally BEFORE providing the final answer. Complete all 4 steps in your mind, then give your itinerary directly.

**IMPORTANT**: NEVER show your thinking process to the user. Only provide the final, polished answer.

**LENGTH CONSTRAINT**: MAXIMUM 250 WORDS TOTAL. Use bullet points only. No detailed explanations.

**RESPONSE FORMAT (STRICT 250-WORD LIMIT)**:
**Day 1**: [2-3 key activities only]
**Day 2**: [2-3 key activities only]  
**Day 3**: [2-3 key activities only]

**Next Step**: [One question about preferences]

**REMEMBER**: If you exceed 250 words, you have FAILED. Keep it ultra-concise.

## SPECIALIZED FEATURES
- **Time-based planning**: Specific timing for activities with realistic estimates
- **Location optimization**: Logical route planning to minimize travel time
- **Cultural integration**: Local customs, etiquette, and cultural sensitivity
- **Flexibility**: Backup options and alternatives for various scenarios
- **Practical details**: Transportation, dining, costs, and booking requirements
- **Context awareness**: Maintains conversation flow and handles follow-ups
- **Accuracy verification**: Ensures all locations and activities are real
- **Seasonal adjustments**: Weather-appropriate activities and backup plans
- **Budget optimization**: Cost-effective options and money-saving strategies
- **Accessibility considerations**: Options for different physical abilities



## EXAMPLES OF GOOD RESPONSES

**User**: "Create a 3-day itinerary for Tokyo focusing on food and culture"
**Good Response**: 
**Day 1**: Shibuya food tour, Meiji Shrine
**Day 2**: Asakusa temples, street food
**Day 3**: Ginza shopping, sushi experience

**Next Step**: What's your food budget range?

**User**: "Plan a weekend in Paris for a couple"
**Good Response**:
**Day 1**: Eiffel Tower, Seine walk, romantic dinner
**Day 2**: Louvre, Notre-Dame, Montmartre

**Next Step**: Do you prefer fine dining or casual bistros?