import llmService from '../services/llmService.js';

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
            
            // Generate LLM response with 3-step process (classification -> function calling -> final response)
            console.log(`[${requestId}] Starting 3-step LLM process...`);
            const llmResponse = await llmService.generateResponse(
                message, 
                currentSessionId, 
                null // External data will be gathered during the process
            );
            console.log(`[${requestId}] 3-step LLM process completed successfully`);
            console.log(`[${requestId}] LLM response length: ${llmResponse.response?.length || 0} characters`);
            console.log(`[${requestId}] LLM context message count: ${llmResponse.context || 0}`);
            console.log(`[${requestId}] LLM used external data: ${llmResponse.usedExternalData ? 'yes' : 'no'}`);
            console.log(`[${requestId}] LLM message category: ${llmResponse.messageCategory || 'unknown'}`);
            console.log(`[${requestId}] LLM prompt type: ${llmResponse.promptType || 'unknown'}`);
            console.log(`[${requestId}] LLM extracted destination: ${llmResponse.extractedDestination || 'none'}`);
            console.log(`[${requestId}] LLM parsed city: ${llmResponse.parsedCity || 'null'}`);
            console.log(`[${requestId}] LLM parsed country: ${llmResponse.parsedCountry || 'null'}`);
            console.log(`[${requestId}] LLM response preview: ${llmResponse.response?.substring(0, 100)}...`);

            // Prepare response
            const response = {
                success: true,
                sessionId: currentSessionId,
                message: llmResponse.response,
                context: {
                    messageCount: llmResponse.context,
                    usedExternalData: llmResponse.usedExternalData,
                    destination: llmResponse.extractedDestination,
                    parsedCity: llmResponse.parsedCity,
                    parsedCountry: llmResponse.parsedCountry,
                    externalData: {} // External data is now handled internally in the LLM service
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