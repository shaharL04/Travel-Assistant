import axios from 'axios';
import fs from 'fs';

class SystemTestRunner {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.testResults = [];
        this.currentSession = null;
    }

    // Test questions organized by category (2 per category)
    getTestQuestions() {
        return {
            'Message Classification': [
                { question: "I want to visit Paris, France", expected: "destination" },
                { question: "Create a 3-day itinerary for Tokyo", expected: "itinerary" }
            ],
            'Destination Extraction': [
                { question: "I want to go to Paris, France", expected: { city: "Paris", country: "France" } },
                { question: "Tell me about Japan", expected: { city: null, country: "Japan" } }
            ],
            'Function Calling': [
                { question: "What's the current weather in Tokyo, Japan?", expected: "weather_function" },
                { question: "Tell me about France's currency and population", expected: "country_function" }
            ],
            'External Data Integration': [
                { question: "What's the weather like in Tokyo and what should I pack?", expected: "weather_data_first" },
                { question: "Tell me about France and suggest some destinations", expected: "country_data_first" }
            ],
            'Destination Recommendations': [
                { question: "I want a romantic destination in Europe", expected: "romantic_suggestions" },
                { question: "Where should I go for a budget backpacking trip?", expected: "budget_suggestions" }
            ],
            'Itinerary Planning': [
                { question: "Create a 2-day itinerary for Paris focusing on culture", expected: "detailed_itinerary" },
                { question: "Plan a weekend in Tokyo for food lovers", expected: "food_itinerary" }
            ],
            'Strategic Planning': [
                { question: "How do I plan a 3-week trip through 5 European countries?", expected: "multi_country_planning" },
                { question: "I want to plan a luxury honeymoon with a $15,000 budget", expected: "luxury_planning" }
            ],
            'Packing Recommendations': [
                { question: "What should I pack for a trip to Tokyo in March?", expected: "weather_aware_packing" },
                { question: "I'm going to Paris in winter, what should I bring?", expected: "seasonal_packing" }
            ],
            'Follow-up & Context': [
                { question: "I want to visit Europe", expected: "initial_question" },
                { question: "France", expected: "follow_up_france" }
            ],
            'Edge Cases': [
                { question: "I want to visit Hogwarts", expected: "fictional_handling" },
                { question: "What's the weather like in 12345?", expected: "invalid_input_handling" }
            ],
            'Cultural Sensitivity': [
                { question: "I want to visit Japan and learn about local customs", expected: "cultural_guidance" },
                { question: "What should I know about visiting Morocco?", expected: "cultural_considerations" }
            ],
            'Budget & Costs': [
                { question: "I have a $2000 budget for a week in Europe, where should I go?", expected: "budget_recommendations" },
                { question: "How much should I budget for food in Tokyo?", expected: "cost_estimates" }
            ]
        };
    }

    async runTest(category, questionData, questionIndex) {
        const testNumber = this.testResults.length + 1;
        console.log(`\n🧪 [${testNumber}] Testing ${category} - Question ${questionIndex + 1}`);
        console.log(`📝 Question: "${questionData.question}"`);
        console.log(`🎯 Expected: ${JSON.stringify(questionData.expected)}`);

        try {
            const startTime = Date.now();
            
            // Make API call
            const response = await axios.post(`${this.baseUrl}/chat`, {
                message: questionData.question,
                sessionId: this.currentSession || 'system-test-session'
            });

            const responseTime = Date.now() - startTime;
            
            // Extract response data
            const responseData = response.data;
            const classification = responseData.classification;
            const parsedDestination = responseData.parsedDestination;
            const responseText = responseData.response;
            const externalData = responseData.externalData;

            // Analyze results
            const analysis = this.analyzeResponse(category, questionData, {
                classification,
                parsedDestination,
                responseText,
                externalData,
                responseTime
            });

            // Store test result
            const testResult = {
                testNumber,
                category,
                question: questionData.question,
                expected: questionData.expected,
                actual: {
                    classification,
                    parsedDestination,
                    responseTime,
                    hasExternalData: !!externalData,
                    responseLength: responseText?.length || 0
                },
                analysis,
                status: analysis.status,
                timestamp: new Date().toISOString()
            };

            this.testResults.push(testResult);

            // Display results
            this.displayTestResult(testResult);

            return testResult;

        } catch (error) {
            console.error(`❌ Error in test ${testNumber}:`, error.message);
            
            const testResult = {
                testNumber,
                category,
                question: questionData.question,
                expected: questionData.expected,
                error: error.message,
                status: 'ERROR',
                timestamp: new Date().toISOString()
            };

            this.testResults.push(testResult);
            return testResult;
        }
    }

    analyzeResponse(category, questionData, response) {
        const { classification, parsedDestination, responseText, externalData, responseTime } = response;
        
        let status = 'PASS';
        let analysis = [];

        // Check response time
        if (responseTime > 5000) {
            status = 'SLOW';
            analysis.push(`Response time (${responseTime}ms) is above 5 seconds`);
        }

        // Check if response exists
        if (!responseText || responseText.length < 50) {
            status = 'FAIL';
            analysis.push('Response is too short or missing');
        }

        // Category-specific analysis
        switch (category) {
            case 'Message Classification':
                if (classification !== questionData.expected) {
                    status = 'FAIL';
                    analysis.push(`Expected classification: ${questionData.expected}, got: ${classification}`);
                }
                break;

            case 'Destination Extraction':
                const expected = questionData.expected;
                if (parsedDestination) {
                    if (expected.city !== null && parsedDestination.city !== expected.city) {
                        status = 'FAIL';
                        analysis.push(`Expected city: ${expected.city}, got: ${parsedDestination.city}`);
                    }
                    if (expected.country !== null && parsedDestination.country !== expected.country) {
                        status = 'FAIL';
                        analysis.push(`Expected country: ${expected.country}, got: ${parsedDestination.country}`);
                    }
                } else {
                    status = 'FAIL';
                    analysis.push('No destination parsed');
                }
                break;

            case 'Function Calling':
                if (questionData.expected === 'weather_function' && !externalData?.weather) {
                    status = 'FAIL';
                    analysis.push('Weather function not called or no weather data returned');
                }
                if (questionData.expected === 'country_function' && !externalData?.country) {
                    status = 'FAIL';
                    analysis.push('Country function not called or no country data returned');
                }
                break;

            case 'External Data Integration':
                if (questionData.expected === 'weather_data_first' && !externalData?.weather) {
                    status = 'FAIL';
                    analysis.push('Weather data not integrated');
                }
                if (questionData.expected === 'country_data_first' && !externalData?.country) {
                    status = 'FAIL';
                    analysis.push('Country data not integrated');
                }
                break;

            case 'Destination Recommendations':
                if (!responseText.toLowerCase().includes('recommend') && 
                    !responseText.toLowerCase().includes('suggest') &&
                    !responseText.toLowerCase().includes('consider')) {
                    status = 'WARN';
                    analysis.push('Response may not contain clear recommendations');
                }
                break;

            case 'Itinerary Planning':
                if (!responseText.toLowerCase().includes('day') && 
                    !responseText.toLowerCase().includes('itinerary') &&
                    !responseText.toLowerCase().includes('schedule')) {
                    status = 'WARN';
                    analysis.push('Response may not contain itinerary structure');
                }
                break;

            case 'Strategic Planning':
                if (!responseText.toLowerCase().includes('plan') && 
                    !responseText.toLowerCase().includes('strategy') &&
                    !responseText.toLowerCase().includes('framework')) {
                    status = 'WARN';
                    analysis.push('Response may not contain strategic planning elements');
                }
                break;

            case 'Packing Recommendations':
                if (!responseText.toLowerCase().includes('pack') && 
                    !responseText.toLowerCase().includes('bring') &&
                    !responseText.toLowerCase().includes('clothing')) {
                    status = 'WARN';
                    analysis.push('Response may not contain packing suggestions');
                }
                break;

            case 'Follow-up & Context':
                if (questionData.expected === 'follow_up_france' && 
                    !responseText.toLowerCase().includes('france')) {
                    status = 'WARN';
                    analysis.push('Follow-up context may not be maintained');
                }
                break;

            case 'Edge Cases':
                if (questionData.expected === 'fictional_handling' && 
                    !responseText.toLowerCase().includes('fictional') &&
                    !responseText.toLowerCase().includes('doesn\'t exist')) {
                    status = 'WARN';
                    analysis.push('Fictional destination handling may not be clear');
                }
                break;

            case 'Cultural Sensitivity':
                if (!responseText.toLowerCase().includes('culture') && 
                    !responseText.toLowerCase().includes('custom') &&
                    !responseText.toLowerCase().includes('local')) {
                    status = 'WARN';
                    analysis.push('Cultural considerations may be missing');
                }
                break;

            case 'Budget & Costs':
                if (!responseText.toLowerCase().includes('budget') && 
                    !responseText.toLowerCase().includes('cost') &&
                    !responseText.toLowerCase().includes('$')) {
                    status = 'WARN';
                    analysis.push('Budget and cost information may be missing');
                }
                break;
        }

        return { status, analysis };
    }

    displayTestResult(testResult) {
        const statusEmoji = {
            'PASS': '✅',
            'WARN': '⚠️',
            'FAIL': '❌',
            'ERROR': '💥'
        };

        console.log(`${statusEmoji[testResult.status]} Test ${testResult.testNumber} - ${testResult.status}`);
        
        if (testResult.analysis && testResult.analysis.length > 0) {
            testResult.analysis.forEach(analysis => {
                console.log(`   📊 ${analysis}`);
            });
        }

        if (testResult.actual) {
            console.log(`   ⏱️  Response time: ${testResult.actual.responseTime}ms`);
            console.log(`   🏷️  Classification: ${testResult.actual.classification}`);
            if (testResult.actual.parsedDestination) {
                console.log(`   🗺️  Destination: city="${testResult.actual.parsedDestination.city}", country="${testResult.actual.parsedDestination.country}"`);
            }
            console.log(`   📊 External data: ${testResult.actual.hasExternalData ? 'Yes' : 'No'}`);
            console.log(`   📝 Response length: ${testResult.actual.responseLength} characters`);
        }

        if (testResult.error) {
            console.log(`   💥 Error: ${testResult.error}`);
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive System Test Suite');
        console.log('=' .repeat(60));
        
        const startTime = Date.now();
        const questions = this.getTestQuestions();
        
        // Test each category
        for (const [category, categoryQuestions] of Object.entries(questions)) {
            console.log(`\n📋 Testing Category: ${category}`);
            console.log('-' .repeat(40));
            
            for (let i = 0; i < categoryQuestions.length; i++) {
                await this.runTest(category, categoryQuestions[i], i);
                
                // Small delay between tests to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        const totalTime = Date.now() - startTime;
        this.generateReport(totalTime);
    }

    generateReport(totalTime) {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 COMPREHENSIVE SYSTEM TEST REPORT');
        console.log('=' .repeat(60));

        // Summary statistics
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
        const warningTests = this.testResults.filter(t => t.status === 'WARN').length;
        const failedTests = this.testResults.filter(t => t.status === 'FAIL').length;
        const errorTests = this.testResults.filter(t => t.status === 'ERROR').length;

        console.log(`\n📈 Test Summary:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   ✅ Passed: ${passedTests}`);
        console.log(`   ⚠️  Warnings: ${warningTests}`);
        console.log(`   ❌ Failed: ${failedTests}`);
        console.log(`   💥 Errors: ${errorTests}`);
        console.log(`   ⏱️  Total Time: ${totalTime}ms`);
        console.log(`   📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        // Category breakdown
        console.log(`\n📋 Results by Category:`);
        const questions = this.getTestQuestions();
        for (const [category, categoryQuestions] of Object.entries(questions)) {
            const categoryResults = this.testResults.filter(t => t.category === category);
            const categoryPassed = categoryResults.filter(t => t.status === 'PASS').length;
            const categoryTotal = categoryResults.length;
            const categoryRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);
            
            console.log(`   ${category}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);
        }

        // Detailed results
        console.log(`\n🔍 Detailed Results:`);
        this.testResults.forEach(test => {
            const statusEmoji = {
                'PASS': '✅',
                'WARN': '⚠️',
                'FAIL': '❌',
                'ERROR': '💥'
            };
            
            console.log(`   ${statusEmoji[test.status]} Test ${test.testNumber}: ${test.category} - ${test.status}`);
        });

        // Save detailed report to file
        const reportData = {
            summary: {
                totalTests,
                passedTests,
                warningTests,
                failedTests,
                errorTests,
                totalTime,
                successRate: ((passedTests / totalTests) * 100).toFixed(1)
            },
            results: this.testResults
        };

        const reportPath = `system-test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`\n💾 Detailed report saved to: ${reportPath}`);

        // Recommendations
        console.log(`\n💡 Recommendations:`);
        if (failedTests > 0) {
            console.log(`   ❌ Address ${failedTests} failed tests first`);
        }
        if (warningTests > 0) {
            console.log(`   ⚠️  Review ${warningTests} warning tests for improvements`);
        }
        if (errorTests > 0) {
            console.log(`   💥 Fix ${errorTests} system errors immediately`);
        }
        if (passedTests === totalTests) {
            console.log(`   🎉 All tests passed! Your system is working perfectly!`);
        }

        console.log('\n' + '=' .repeat(60));
    }

    async checkServerHealth() {
        try {
            console.log('🏥 Checking server health...');
            const response = await axios.post(`${this.baseUrl}/chat`, {
                message: "Hello",
                sessionId: 'health-check'
            });
            
            if (response.status === 200) {
                console.log('✅ Server is running and responding');
                return true;
            }
        } catch (error) {
            console.error('❌ Server health check failed:', error.message);
            return false;
        }
    }
}

// Main execution
async function main() {
    const testRunner = new SystemTestRunner();
    
    // Check if server is running
    const serverHealthy = await testRunner.checkServerHealth();
    if (!serverHealthy) {
        console.error('❌ Cannot run tests - server is not responding');
        console.log('💡 Make sure to run: npm run dev');
        process.exit(1);
    }

    // Run all tests
    await testRunner.runAllTests();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 Test suite failed:', error);
        process.exit(1);
    });
}

export default SystemTestRunner;
