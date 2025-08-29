import llmService from '../services/llmService.js';
import apiService from '../services/apiService.js';

class ChatController {
    async newUserMessage(req, res) {
        const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const startTime = Date.now();
        
        console.log(`[${requestId}] [${new Date().toISOString()}] Processing new user message request`);
        console.log(`[${requestId}] Request path: ${req.path}`);
        console.log(`[${requestId}] Request method: ${req.method}`);
        
        try {
            const { message, sessionId } = req.body;
            
            console.log(`[${requestId}] Extracted message: "${message}"`);
            console.log(`[${requestId}] Session ID from request: ${sessionId || 'not provided'}`);
            
            if (!message || typeof message !== 'string') {
                console.log(`[${requestId}] Validation failed: message is ${!message ? 'missing' : 'not a string'}`);
                return res.status(400).json({
                    success: false,
                    error: 'Message is required and must be a string'
                });
            }

            // Use sessionId from frontend, or generate a simple fallback if not provided
            const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            console.log(`[${requestId}] Using session ID: ${currentSessionId}`);

            // Extract destination from message for external data
            console.log(`[${requestId}] Extracting destination from message...`);
            const destination = apiService.extractDestination(message);
            console.log(`[${requestId}] Extracted destination: ${destination || 'none detected'}`);
            
            // Get conversation context for enhanced decision making
            const conversationContext = llmService.getConversationContext(sessionId);
            console.log(`[${requestId}] Conversation context has ${conversationContext.length} messages`);
            
            // Get relevant external data with enhanced decision logic
            console.log(`[${requestId}] Fetching external data for destination: ${destination}`);
            const externalDataResult = await apiService.getRelevantExternalData(message, destination, conversationContext);
            console.log(`[${requestId}] External data decision:`, externalDataResult.decision);
            console.log(`[${requestId}] External data retrieved:`, Object.keys(externalDataResult.data));
            
            const externalData = externalDataResult.data;
            
            // Generate LLM response with external data - THIS IS WHERE THE MAGIC HAPPENS
            console.log(`[${requestId}] Generating LLM response...`);
            const llmResponse = await llmService.generateResponse(
                message, 
                currentSessionId, 
                externalData
            );
            console.log(`[${requestId}] LLM response generated successfully`);
            console.log(`[${requestId}] LLM response length: ${llmResponse.response?.length || 0} characters`);
            console.log(`[${requestId}] LLM context message count: ${llmResponse.context || 0}`);
            console.log(`[${requestId}] LLM used external data: ${llmResponse.usedExternalData ? 'yes' : 'no'}`);
            console.log(`[${requestId}] LLM message category: ${llmResponse.messageCategory || 'unknown'}`);
            console.log(`[${requestId}] LLM prompt type: ${llmResponse.promptType || 'unknown'}`);
            console.log(`[${requestId}] LLM response preview: ${llmResponse.response?.substring(0, 100)}...`);

            // Prepare response
            const response = {
                success: true,
                sessionId: currentSessionId,
                message: llmResponse.response,
                context: {
                    messageCount: llmResponse.context,
                    usedExternalData: llmResponse.usedExternalData,
                    destination: destination,
                    externalData: externalData
                },
                timestamp: new Date().toISOString()
            };

            const endTime = Date.now();
            const processingTime = endTime - startTime;
            
            console.log(`[${requestId}] Response prepared successfully`);
            console.log(`[${requestId}] Processing time: ${processingTime}ms`);
            console.log(`[${requestId}] Response status: 200`);
            console.log(`[${requestId}] Response body:`, JSON.stringify(response, null, 2));
            console.log(`[${requestId}] Request completed successfully`);

            res.json(response);

        } catch (error) {
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            
            console.error(`[${requestId}] Chat Controller Error:`, error);
            console.error(`[${requestId}] Error stack:`, error.stack);
            console.error(`[${requestId}] Processing time before error: ${processingTime}ms`);
            console.error(`[${requestId}] Request failed with error`);
            
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'I apologize, but I\'m having trouble processing your request. Please try again.'
            });
        }
    }

}

export default new ChatController();