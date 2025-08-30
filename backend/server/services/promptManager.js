import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PromptManager {
    constructor() {
        this.promptsPath = path.join(__dirname, '..', 'prompts');
        this.promptCache = new Map();
        this.initializePrompts();
    }

    async initializePrompts() {
        try {
            // Pre-load all prompts into cache for faaster loading
            const promptFiles = [
                'system-prompt.md',
                'destination-prompt.md',
                'planning-prompt.md',
                'itinerary-prompt.md',
                'packing-prompt.md',
                'classification-prompt.md'
            ];

            for (const file of promptFiles) {
                await this.loadPrompt(file);
            }

            console.log('All prompts loaded successfully');
        } catch (error) {
            console.error('Error initializing prompts:', error);
        }
    }

    async loadPrompt(filename) {
        try {
            // Check cache first
            if (this.promptCache.has(filename)) {
                return this.promptCache.get(filename);
            }

            const filePath = path.join(this.promptsPath, filename);
            const content = await fs.promises.readFile(filePath, 'utf8');
            
            // Cache the prompt
            this.promptCache.set(filename, content);
            
            return content;
        } catch (error) {
            console.error(`Error loading prompt ${filename}:`, error);
            throw new Error(`Failed to load prompt: ${filename}`);
        }
    }

    async getSystemPrompt() {
        return await this.loadPrompt('system-prompt.md');
    }

    async getDestinationPrompt() {
        return await this.loadPrompt('destination-prompt.md');
    }

    async getPlanningPrompt() {
        return await this.loadPrompt('planning-prompt.md');
    }

    async getItineraryPrompt() {
        return await this.loadPrompt('itinerary-prompt.md');
    }

    async getPackingPrompt() {
        return await this.loadPrompt('packing-prompt.md');
    }

    async getClassificationPrompt() {
        return await this.loadPrompt('classification-prompt.md');
    }

    replaceTemplateVariables(template, variables) {
        let result = template;
        
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            result = result.replace(new RegExp(placeholder, 'g'), value || '');
        });
        
        return result;
    }

    async buildDestinationPrompt(userMessage, context, externalData = null) {
        const systemPrompt = await this.getSystemPrompt();
        const destinationTemplate = await this.getDestinationPrompt();
        
        const variables = {
            SYSTEM_PROMPT: systemPrompt,
            CONVERSATION_HISTORY: context.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
            USER_MESSAGE: userMessage,
            EXTERNAL_DATA_JSON: externalData ? JSON.stringify(externalData) : 'None available'
        };

        return this.replaceTemplateVariables(destinationTemplate, variables);
    }

    async buildPlanningPrompt(userMessage, context, externalData = null) {
        const systemPrompt = await this.getSystemPrompt();
        const planningTemplate = await this.getPlanningPrompt();
        
        const variables = {
            SYSTEM_PROMPT: systemPrompt,
            USER_MESSAGE: userMessage,
            CONVERSATION_HISTORY: context.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
            EXTERNAL_DATA_JSON: externalData ? JSON.stringify(externalData) : 'None available'
        };

        return this.replaceTemplateVariables(planningTemplate, variables);
    }

    async buildItineraryPrompt(userMessage, context, externalData = null) {
        const systemPrompt = await this.getSystemPrompt();
        const itineraryTemplate = await this.getItineraryPrompt();
        
        const variables = {
            SYSTEM_PROMPT: systemPrompt,
            USER_MESSAGE: userMessage,
            CONVERSATION_HISTORY: context.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
            EXTERNAL_DATA_JSON: externalData ? JSON.stringify(externalData) : 'None available'
        };

        return this.replaceTemplateVariables(itineraryTemplate, variables);
    }

    async buildPackingPrompt(userMessage, context, externalData = null) {
        const systemPrompt = await this.getSystemPrompt();
        const packingTemplate = await this.getPackingPrompt();
        
        const variables = {
            SYSTEM_PROMPT: systemPrompt,
            USER_MESSAGE: userMessage,
            CONVERSATION_HISTORY: context.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
            EXTERNAL_DATA_JSON: externalData ? JSON.stringify(externalData) : 'None available'
        };

        return this.replaceTemplateVariables(packingTemplate, variables);
    }

    async buildClassificationPrompt(userMessage, context = []) {
        const classificationTemplate = await this.getClassificationPrompt();
        
        const variables = {
            USER_MESSAGE: userMessage,
            CONVERSATION_CONTEXT: context.map(msg => `${msg.role}: ${msg.content}`).join('\n')
        };

        return this.replaceTemplateVariables(classificationTemplate, variables);
    }

    // Helper method to extract the actual prompt content from markdown
    extractPromptContent(markdownContent) {
        const lines = markdownContent.split('\n');
        const promptLines = [];
        let inPromptSection = false;
        
        for (const line of lines) {
            if (line.startsWith('#') || line.startsWith('##') || line.startsWith('###')) {
                continue;
            }
            
            // If we find a code block, extract content between ```
            if (line.startsWith('```') && !inPromptSection) {
                inPromptSection = true;
                continue;
            }
            if (line.startsWith('```') && inPromptSection) {
                inPromptSection = false;
                break;
            }
            
            if (inPromptSection) {
                promptLines.push(line);
            }
            else if (line.trim() !== '' && !line.startsWith('##') && !line.startsWith('USAGE') && !line.startsWith('VARIABLES') && !line.startsWith('CHAIN') && !line.startsWith('EXPECTED') && !line.startsWith('SPECIALIZED')) {
                promptLines.push(line);
            }
        }
        
        const result = promptLines.join('\n').trim();
        
        // If no content was extracted (no code blocks found), return the original content
        // but remove markdown headers and documentation
        if (!result) {
            return lines
                .filter(line => 
                    !line.startsWith('#') && 
                    line.trim() !== '' && 
                    !line.startsWith('##') && 
                    !line.startsWith('USAGE') && 
                    !line.startsWith('VARIABLES') && 
                    !line.startsWith('CHAIN') && 
                    !line.startsWith('EXPECTED') && 
                    !line.startsWith('SPECIALIZED')
                )
                .join('\n')
                .trim();
        }
        
        return result;
    }
}

export default new PromptManager();
