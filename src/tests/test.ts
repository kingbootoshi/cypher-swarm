import { Logger } from '../utils/logger';
import { gatherUserInteractions, formatUserInteractions, getFormattedInteractionSummary } from '../utils/extractTweetActions';

// Enable logging
Logger.enable();

async function runTest() {
    try {
        Logger.log('Starting Tweet Actions Test...');

        // Test gathering user interactions
        Logger.log('\n1. Testing gatherUserInteractions:');
        const userInteractions = await gatherUserInteractions();
        Logger.log('User Interactions Map:', userInteractions);

        // Test formatting the interactions
        Logger.log('\n2. Testing formatUserInteractions:');
        const formattedInteractions = formatUserInteractions(userInteractions);
        Logger.log('Formatted Interactions:', formattedInteractions);

        // Test getting the complete summary
        Logger.log('\n3. Testing complete interaction summary:');
        const summary = await getFormattedInteractionSummary();
        Logger.log('Complete Summary:', summary);

    } catch (error) {
        Logger.log('Error during test:', error);
    }
}

// Run the test
runTest().then(() => {
    Logger.log('Test completed');
}).catch(error => {
    Logger.log('Test failed:', error);
});
