import AIProcessedPDF from '../models/ai-processed-pdf.model.js';
import geminiService from '../services/gemini.service.js';

// Process PDF with Gemini API and store generated content
export const processPDFWithAI = async (req, res) => {
  try {
    const { title, description, subject, tags, uploaderName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    // Check if file is PDF
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed",
      });
    }

    // Convert PDF to base64 for Gemini API
    const fs = await import('fs');
    const pdfBuffer = fs.readFileSync(file.path);
    const pdfBase64 = pdfBuffer.toString('base64');

    // Create AI processed PDF record with processing status
    const aiProcessedPDF = new AIProcessedPDF({
      title,
      description,
      subject,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      uploaderName: uploaderName || "Anonymous User",
      originalFileName: file.originalname,
      fileSize: file.size,
      summary: "Processing...",
      quizzes: [],
      flashcards: [],
      keyPoints: [],
      status: 'processing'
    });

    await aiProcessedPDF.save();

    // Process PDF with Gemini API (async)
    const startTime = Date.now();
    geminiService.processPDFAndGenerateContent(pdfBase64, subject)
      .then(async (generatedContent) => {
        try {
          const processingTime = Date.now() - startTime;
          
          // Update AI processed PDF with generated data
          await AIProcessedPDF.findByIdAndUpdate(aiProcessedPDF._id, {
            summary: generatedContent.summary,
            quizzes: generatedContent.quizzes,
            flashcards: generatedContent.flashcards,
            keyPoints: generatedContent.keyPoints,
            status: 'completed',
            processingTime
          });
        } catch (updateError) {
          console.error('Error updating AI processed PDF:', updateError);
          await AIProcessedPDF.findByIdAndUpdate(aiProcessedPDF._id, {
            status: 'failed',
            errorMessage: 'Failed to update generated content'
          });
        }
      })
      .catch(async (error) => {
        console.error('Error in AI processing:', error);
        await AIProcessedPDF.findByIdAndUpdate(aiProcessedPDF._id, {
          status: 'failed',
          errorMessage: error.message
        });
      });

    // Delete the uploaded file since we don't need to store it
    fs.unlinkSync(file.path);

    res.status(201).json({
      success: true,
      message: "PDF uploaded for AI processing! Content is being generated in the background.",
      aiProcessedPDFId: aiProcessedPDF._id
    });

  } catch (error) {
    console.error("AI Processing error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all AI processed PDFs
export const getAllAIProcessedPDFs = async (req, res) => {
  try {
    const aiProcessedPDFs = await AIProcessedPDF.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      aiProcessedPDFs
    });

  } catch (error) {
    console.error("Get AI processed PDFs error:", error);
    res.status(500).json({ success: false, message: "Failed to get AI processed PDFs" });
  }
};

// Get AI processed PDF by ID
export const getAIProcessedPDFById = async (req, res) => {
  try {
    const { id } = req.params;

    const aiProcessedPDF = await AIProcessedPDF.findById(id);
    
    if (!aiProcessedPDF) {
      return res.status(404).json({
        success: false,
        message: "AI processed PDF not found"
      });
    }

    res.json({
      success: true,
      aiProcessedPDF
    });

  } catch (error) {
    console.error("Get AI processed PDF error:", error);
    res.status(500).json({ success: false, message: "Failed to get AI processed PDF" });
  }
};

// Regenerate AI content for a PDF
export const regenerateAIContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const aiProcessedPDF = await AIProcessedPDF.findById(id);
    
    if (!aiProcessedPDF) {
      return res.status(404).json({
        success: false,
        message: "AI processed PDF not found"
      });
    }

    // Update status to processing
    await AIProcessedPDF.findByIdAndUpdate(id, {
      status: 'processing',
      summary: "Processing...",
      quizzes: [],
      flashcards: [],
      keyPoints: []
    });

    // Note: Since we don't store the original PDF, regeneration would require re-upload
    // For now, we'll just update the status
    res.json({
      success: true,
      message: "AI content regeneration requested. Please re-upload the PDF for new processing.",
      aiProcessedPDFId: id
    });

  } catch (error) {
    console.error("Regenerate AI content error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete AI processed PDF
export const deleteAIProcessedPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const aiProcessedPDF = await AIProcessedPDF.findByIdAndDelete(id);
    
    if (!aiProcessedPDF) {
      return res.status(404).json({
        success: false,
        message: "AI processed PDF not found"
      });
    }

    res.json({
      success: true,
      message: "AI processed PDF deleted successfully"
    });

  } catch (error) {
    console.error("Delete AI processed PDF error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get AI processed PDFs by subject
export const getAIProcessedPDFsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;

    const aiProcessedPDFs = await AIProcessedPDF.find({ 
      subject: { $regex: subject, $options: 'i' },
      status: 'completed'
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      aiProcessedPDFs
    });

  } catch (error) {
    console.error("Get AI processed PDFs by subject error:", error);
    res.status(500).json({ success: false, message: "Failed to get AI processed PDFs by subject" });
  }
};
