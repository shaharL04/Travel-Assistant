# Destination Recommendation Prompt Template

## PROMPT STRUCTURE

```
{{SYSTEM_PROMPT}}

CONVERSATION CONTEXT:
{{CONVERSATION_HISTORY}}

CURRENT REQUEST: {{USER_MESSAGE}}

EXTERNAL DATA: {{EXTERNAL_DATA_JSON}}

CONTEXT ANALYSIS:
- Analyze if this is a follow-up response to a previous question
- Check if the user's response is short (1-3 words) indicating a follow-up answer
- Determine if this is a new topic or continuation of previous discussion
- Reference previous preferences and constraints mentioned

ACCURACY VERIFICATION:
- Verify that the requested destination is real and exists
- If external data is available, use it to confirm destination details
- If the destination is fictional or unknown, clearly state this
- Do NOT invent attractions, restaurants, or details for fictional places
- Offer real alternatives with similar characteristics

CHAIN OF THOUGHT ANALYSIS:
Let me think through this step by step:

1. ANALYZE THE REQUEST:
   - What type of destination recommendation is the user seeking?
   - Is this a response to a previous question or a new request?
   - What context do we have from previous messages?
   - Are all mentioned destinations real and verifiable?
   - What specific criteria are they looking for (budget, activities, season)?

2. EVALUATE DESTINATION OPTIONS:
   - Consider destinations that match the user's criteria
   - Evaluate based on:
     * Budget suitability and cost considerations
     * Seasonal appropriateness and weather conditions
     * Accessibility and transportation options
     * Cultural and personal interests mentioned
     * Safety and practical considerations
   - Verify each destination is real and exists
   - Cross-reference with external data when available

3. FORMULATE RECOMMENDATIONS:
   - What specific destinations best match their needs?
   - How can I make these recommendations actionable?
   - What unique aspects of each destination should I highlight?
   - What follow-up question would provide the most value?
   - Are all recommendations based on real, verifiable destinations?

4. PROVIDE RESPONSE:
   - Clear, structured destination recommendations
   - Specific details and reasoning for each suggestion
   - Practical considerations and tips
   - ONE focused follow-up question if needed
   - Clear acknowledgment if any destinations are fictional

Please respond as TravelGPT with this structured approach:
```

## USAGE CONTEXT
This prompt is used for:
- Destination recommendations
- Location-specific queries
- General travel advice
- Cultural information requests
- Follow-up question handling
- Fictional destination handling

## VARIABLES
- `{{SYSTEM_PROMPT}}`: The main TravelGPT system prompt
- `{{CONVERSATION_HISTORY}}`: Previous messages in the conversation
- `{{USER_MESSAGE}}`: The current user's request
- `{{EXTERNAL_DATA_JSON}}`: Weather, country, or travel data (if available)

## EXPECTED RESPONSE
- **CoT – Expected response**: Show the chain of thought in the final answer step by step, then provide the final answer. Each step should be summarized briefly.
- Specific destination recommendations (only for real places)
- Cultural insights and practical tips
- Budget and timing considerations
- ONE focused follow-up question if needed
- Integration of external data when relevant
- Context-aware responses that reference previous conversation
- Clear acknowledgment if destination is fictional with real alternatives

## FOLLOW-UP HANDLING
- Detect short responses and interpret them in context
- Maintain conversation flow across multiple exchanges
- Adapt to topic changes while preserving relevant context
- Ask specific, actionable questions one at a time

## HALLUCINATION PROTECTION
- Verify all destinations are real before providing recommendations
- Use external data when available to confirm information
- Clearly state when a destination is fictional or unknown
- Offer real alternatives instead of inventing details
- Maintain accuracy while being helpful and engaging
