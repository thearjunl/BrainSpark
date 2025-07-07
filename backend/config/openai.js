import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateQuestionsFromText = async (text, subject = 'general') => {
  try {
    const prompt = `
    Based on the following text, generate 10 questions (5 multiple choice and 5 short answer) for educational purposes.
    
    Text: ${text}
    Subject: ${subject}
    
    Generate questions in this exact JSON format:
    [
      {
        "questionText": "What is the boiling point of water?",
        "type": "mcq",
        "options": {
          "A": "90°C",
          "B": "100°C", 
          "C": "110°C",
          "D": "120°C"
        },
        "correctAnswer": "B"
      },
      {
        "questionText": "Define photosynthesis.",
        "type": "short_answer",
        "correctAnswer": "It is the process by which plants make food using sunlight."
      }
    ]
    
    Make sure the questions are:
    - Relevant to the provided text
    - Educational and clear
    - Multiple choice questions have exactly 4 options (A, B, C, D)
    - Short answer questions have concise but complete correct answers
    - Return only valid JSON without any additional text
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an educational content generator. Generate questions based on provided text in the exact JSON format specified."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    
    // Parse the JSON response
    const questions = JSON.parse(response);
    
    return questions;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate questions from text');
  }
};

export default openai; 