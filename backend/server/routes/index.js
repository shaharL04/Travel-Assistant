import { Router } from "express";
import chatController from "../controllers/chatController.js";

const router = Router();

// Request logging middleware
router.use((req, res, next) => {
    // Use sessionId from frontend if available, otherwise use a simple timestamp-based ID
    const requestId = req.body?.sessionId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    // Add request ID to request object for use in controllers
    req.requestId = requestId;
    
    // Log request body for POST requests
    if (req.method === 'POST' && req.body) {
        console.log(`[${requestId}] Request body:`, JSON.stringify(req.body, null, 2));
    }
    
    // Log response
    const originalSend = res.send;
    res.send = function(data) {
        console.log(`[${requestId}] Response status: ${res.statusCode}`);
        console.log(`[${requestId}] Response sent at: ${new Date().toISOString()}`);
        return originalSend.call(this, data);
    };
    
    next();
});

// Main chat endpoint
router.post('/chat', chatController.newUserMessage);



export default router;