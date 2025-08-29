# Complex Travel Planning Prompt Template

## PROMPT STRUCTURE

```
{{SYSTEM_PROMPT}}

PLANNING REQUEST: {{USER_MESSAGE}}

CONVERSATION HISTORY:
{{CONVERSATION_HISTORY}}

EXTERNAL DATA: {{EXTERNAL_DATA_JSON}}

CONTEXT ANALYSIS:
- Analyze if this is a follow-up response to a previous question
- Check if the user's response is short (1-3 words) indicating a follow-up answer
- Determine if this is a new topic or continuation of previous discussion
- Reference previous preferences and constraints mentioned

ACCURACY VERIFICATION:
- Verify that all destinations mentioned are real and exist
- If external data is available, use it to confirm destination details
- If any destination is fictional or unknown, clearly state this
- Do NOT create plans for fictional places
- Offer real alternatives with similar characteristics

COMPLEX PLANNING CHAIN OF THOUGHT ANALYSIS:
Let me think through this step by step:

STEP 1: ANALYZE THE PLANNING REQUEST
- What type of planning is needed? (multi-city, budget, seasonal, logistics)
- Is this a response to a previous question or a new request?
- What are the key constraints and requirements?
- What level of complexity is involved?
- Are all mentioned destinations real and verifiable?

STEP 2: EVALUATE PLANNING REQUIREMENTS
- Consider the planning scope and complexity
- Evaluate based on:
  * Multi-city coordination needs
  * Budget constraints and optimization
  * Seasonal factors and timing
  * Transportation and logistics
  * Accommodation requirements
  * Risk management needs
  * All destinations must be real and verifiable

STEP 3: STRUCTURE THE PLANNING FRAMEWORK
- Create a logical planning approach
- Consider:
  * Route optimization and sequencing
  * Budget allocation and cost management
  * Timeline and scheduling
  * Resource allocation
  * Contingency planning
  * All locations must be real and verifiable

STEP 4: DEVELOP SPECIFIC RECOMMENDATIONS
- Provide actionable planning steps
- Include:
  * Specific recommendations with reasoning
  * Cost estimates and budget breakdowns
  * Timeline and scheduling details
  * Alternative options and flexibility
  * Risk mitigation strategies
  * All recommendations must be based on real, existing places

STEP 5: PROVIDE IMPLEMENTATION GUIDANCE
- Clear next steps and action items
- Practical implementation advice
- Resource requirements and preparation
- Monitoring and adjustment strategies
- Success metrics and evaluation criteria

Please provide a comprehensive travel planning response with this structured approach:
```

## USAGE CONTEXT
This prompt is used for:
- Multi-city trip planning and coordination
- Budget optimization and financial planning
- Seasonal planning and weather considerations
- Transportation and logistics coordination
- Accommodation strategy and booking planning
- Timeline optimization and scheduling
- Risk management and contingency planning
- Follow-up question handling
- Fictional destination handling

## VARIABLES
- `{{SYSTEM_PROMPT}}`: The main TravelGPT system prompt
- `{{USER_MESSAGE}}`: The planning request
- `{{CONVERSATION_HISTORY}}`: Previous messages in the conversation
- `{{EXTERNAL_DATA_JSON}}`: Weather, country, or travel data (if available)

## PLANNING CAPABILITIES
- **Multi-city trip planning** - Coordinate logistics across multiple destinations
- **Budget optimization** - Help users maximize value within their budget constraints
- **Seasonal planning** - Consider weather, crowds, and seasonal factors
- **Transportation coordination** - Plan flights, trains, buses, and local transport
- **Accommodation strategy** - Recommend lodging based on location, budget, and preferences
- **Timeline optimization** - Create efficient schedules and itineraries
- **Risk management** - Consider travel insurance, backup plans, and contingencies

## EXPECTED RESPONSE FORMAT
**CoT – Expected response**: Show the chain of thought in the final answer step by step, then provide the final answer. Each step should be summarized briefly.

```
Planning Overview:
- [Brief summary of the planning approach]

Key Planning Areas:
1. [Area 1 with specific recommendations]
2. [Area 2 with specific recommendations]
3. [Area 3 with specific recommendations]

Implementation Steps:
- [Step 1 with timeline and resources]
- [Step 2 with timeline and resources]
- [Step 3 with timeline and resources]

Budget Considerations:
- [Budget breakdown and allocation]
- [Cost-saving strategies]
- [Priority spending recommendations]

Risk Management:
- [Potential issues and solutions]
- [Contingency plans]
- [Insurance and backup options]

Next Steps:
- [Immediate action items]
- [Timeline for implementation]
- [Success metrics and evaluation]
```

## SPECIALIZED FEATURES
- **Multi-step reasoning**: Complex planning with logical progression
- **Constraint management**: Budget, time, and resource optimization
- **Risk assessment**: Identification and mitigation of potential issues
- **Flexibility**: Alternative options and contingency planning
- **Practical implementation**: Actionable steps and timelines
- **Context awareness**: Maintains conversation flow and handles follow-ups
- **Accuracy verification**: Ensures all destinations and recommendations are real

## FOLLOW-UP HANDLING
- Detect short responses and interpret them in context
- Maintain conversation flow across multiple exchanges
- Adapt to topic changes while preserving relevant context
- Ask specific, actionable questions one at a time
- Reference previous planning decisions when providing updates

## HALLUCINATION PROTECTION
- Verify all destinations are real before creating plans
- Use external data when available to confirm information
- Clearly state when any destination is fictional or unknown
- Offer real alternatives instead of creating plans for fictional places
- Ensure all recommendations are based on real, existing locations
- Maintain accuracy while providing comprehensive planning guidance
