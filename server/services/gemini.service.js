import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Extract text from PDF using Gemini Vision
  async extractTextFromPDF(pdfBase64) {
    try {
      const prompt = `
        Please extract and return the complete text content from this PDF document. 
        Return only the extracted text without any additional formatting or explanations.
        If there are tables, convert them to readable text format.
        If there are images, describe their content briefly.
        Ensure all text is properly extracted and readable.
      `;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64
          }
        }
      ]);

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Generate AI content from PDF text
  async generateAIContent(pdfText, subject) {
    try {
      const prompt = `
        You are an expert educational content creator. Based on the following PDF content about "${subject}", please generate:

        1. A comprehensive summary (200-300 words)
        2. 5 multiple choice questions with 4 options each, correct answers, and explanations
        3. 10 flashcards with front (question/concept) and back (answer/explanation)
        4. 8-10 key points or main takeaways

        PDF Content:
        ${pdfText}

        Please format your response as a JSON object with the following structure:
        {
          "summary": "comprehensive summary here",
          "quizzes": [
            {
              "question": "question text",
              "options": ["option1", "option2", "option3", "option4"],
              "correctAnswer": "correct option text",
              "explanation": "explanation for the answer"
            }
          ],
          "flashcards": [
            {
              "front": "front side text",
              "back": "back side text"
            }
          ],
          "keyPoints": ["point1", "point2", "point3"]
        }

        Ensure all content is accurate, educational, and directly related to the PDF content.
        Make questions challenging but fair, and explanations clear and helpful.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Try to parse JSON response
      try {
        // Extract JSON from the response (sometimes Gemini adds extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        console.log('Raw response:', content);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw new Error('Failed to generate AI content');
    }
  }

  // Generate content directly from PDF (combines both methods)
  async processPDFAndGenerateContent(pdfBase64, subject) {
    try {
      // First extract text from PDF
      const extractedText = await this.extractTextFromPDF(pdfBase64);
      
      // Then generate AI content from the extracted text
      const aiContent = await this.generateAIContent(extractedText, subject);
      
      return aiContent;
    } catch (error) {
      console.error('Error processing PDF and generating content:', error);
      throw error;
    }
  }
}

export default new GeminiService();
