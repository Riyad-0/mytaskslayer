/**
 * AI Service Skeleton
 * Responsible for generating monster names and flavor text.
 */

// Mock implementation for initial setup
export const generateMonsterData = async (taskDescription) => {
    console.log(`Generating AI data for task: ${taskDescription}`);

    // In production, this will call Google Gemini or OpenAI
    return {
        name: "The Logic Demon",
        flavorText: "A beast born from the complexities of Calculus. Its skin is made of parchment and its eyes glow with mathematical fury.",
        hp: 100,
        type: "Mental"
    };
};
