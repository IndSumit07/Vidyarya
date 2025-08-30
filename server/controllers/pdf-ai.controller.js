import PDF from '../models/pdf.model.js';
import PDFAiContent from '../models/pdf-ai-content.model.js';
import geminiService from '../services/gemini.service.js';
import fs from 'fs';

// Upload PDF and generate AI content
export const uploadPDFAndGenerateContent = async (req, res) => {
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
    const pdfBuffer = fs.readFileSync(file.path);
    const pdfBase64 = pdfBuffer.toString('base64');

    // Create PDF record first
    const pdf = new PDF({
      title,
      description,
      originalName: file.originalname,
      cloudinaryUrl: `/uploads/${file.filename}`, // For now, using local path
      cloudinaryPublicId: file.filename,
      fileSize: file.size,
      mimeType: file.mimetype,
      subject,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      uploadedBy: uploaderName || "Anonymous User",
      isPublic: true
    });

    await pdf.save();

    // Create AI content record with processing status
    const aiContent = new PDFAiContent({
      pdfId: pdf._id,
      summary: "Processing...",
      quizzes: [],
      flashcards: [],
      keyPoints: [],
      status: 'processing'
    });

    await aiContent.save();

    // Process PDF with Gemini API (async)
    geminiService.processPDFAndGenerateContent(pdfBase64, subject)
      .then(async (generatedContent) => {
        try {
          // Update AI content with generated data
          await PDFAiContent.findByIdAndUpdate(aiContent._id, {
            summary: generatedContent.summary,
            quizzes: generatedContent.quizzes,
            flashcards: generatedContent.flashcards,
            keyPoints: generatedContent.keyPoints,
            status: 'completed'
          });
        } catch (updateError) {
          console.error('Error updating AI content:', updateError);
          await PDFAiContent.findByIdAndUpdate(aiContent._id, {
            status: 'failed',
            errorMessage: 'Failed to update generated content'
          });
        }
      })
      .catch(async (error) => {
        console.error('Error in AI processing:', error);
        await PDFAiContent.findByIdAndUpdate(aiContent._id, {
          status: 'failed',
          errorMessage: error.message
        });
      });

    res.status(201).json({
      success: true,
      message: "PDF uploaded successfully! AI content is being generated in the background.",
      pdf,
      aiContentId: aiContent._id
    });

  } catch (error) {
    console.error("Upload PDF error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get AI content for a specific PDF
export const getAIContent = async (req, res) => {
  try {
    const { pdfId } = req.params;

    const aiContent = await PDFAiContent.findOne({ pdfId }).populate('pdfId');
    
    if (!aiContent) {
      return res.status(404).json({
        success: false,
        message: "AI content not found for this PDF"
      });
    }

    res.json({
      success: true,
      aiContent
    });

  } catch (error) {
    console.error("Get AI content error:", error);
    res.status(500).json({ success: false, message: "Failed to get AI content" });
  }
};

// Get all PDFs with AI content status
export const getAllPDFsWithAIStatus = async (req, res) => {
  try {
    const pdfs = await PDF.find().sort({ createdAt: -1 });
    
    // Get AI content status for each PDF
    const pdfsWithAIStatus = await Promise.all(
      pdfs.map(async (pdf) => {
        const aiContent = await PDFAiContent.findOne({ pdfId: pdf._id });
        return {
          ...pdf.toObject(),
          aiContentStatus: aiContent ? aiContent.status : 'not_generated',
          hasAIContent: !!aiContent && aiContent.status === 'completed'
        };
      })
    );

    res.json({
      success: true,
      pdfs: pdfsWithAIStatus
    });

  } catch (error) {
    console.error("Get PDFs with AI status error:", error);
    res.status(500).json({ success: false, message: "Failed to get PDFs" });
  }
};

// Regenerate AI content for a PDF
export const regenerateAIContent = async (req, res) => {
  try {
    const { pdfId } = req.params;
    
    const pdf = await PDF.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found"
      });
    }

    // Check if AI content exists
    let aiContent = await PDFAiContent.findOne({ pdfId });
    
    if (!aiContent) {
      // Create new AI content record
      aiContent = new PDFAiContent({
        pdfId: pdf._id,
        summary: "Processing...",
        quizzes: [],
        flashcards: [],
        keyPoints: [],
        status: 'processing'
      });
      await aiContent.save();
    } else {
      // Update existing record to processing
      await PDFAiContent.findByIdAndUpdate(aiContent._id, {
        status: 'processing',
        summary: "Processing...",
        quizzes: [],
        flashcards: [],
        keyPoints: []
      });
    }

    // Read PDF file and convert to base64
    const pdfPath = pdf.cloudinaryUrl.replace('/uploads/', 'uploads/');
    if (fs.existsSync(pdfPath)) {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfBase64 = pdfBuffer.toString('base64');

      // Process PDF with Gemini API (async)
      geminiService.processPDFAndGenerateContent(pdfBase64, pdf.subject)
        .then(async (generatedContent) => {
          try {
            await PDFAiContent.findByIdAndUpdate(aiContent._id, {
              summary: generatedContent.summary,
              quizzes: generatedContent.quizzes,
              flashcards: generatedContent.flashcards,
              keyPoints: generatedContent.keyPoints,
              status: 'completed'
            });
          } catch (updateError) {
            console.error('Error updating AI content:', updateError);
            await PDFAiContent.findByIdAndUpdate(aiContent._id, {
              status: 'failed',
              errorMessage: 'Failed to update generated content'
            });
          }
        })
        .catch(async (error) => {
          console.error('Error in AI processing:', error);
          await PDFAiContent.findByIdAndUpdate(aiContent._id, {
            status: 'failed',
            errorMessage: error.message
          });
        });

      res.json({
        success: true,
        message: "AI content regeneration started",
        aiContentId: aiContent._id
      });
    } else {
      res.status(404).json({
        success: false,
        message: "PDF file not found on server"
      });
    }

  } catch (error) {
    console.error("Regenerate AI content error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete PDF and its AI content
export const deletePDF = async (req, res) => {
  try {
    const { pdfId } = req.params;

    // Delete AI content first
    await PDFAiContent.deleteMany({ pdfId });
    
    // Delete PDF
    const pdf = await PDF.findByIdAndDelete(pdfId);
    
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found"
      });
    }

    // Delete file from server
    const pdfPath = pdf.cloudinaryUrl.replace('/uploads/', 'uploads/');
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    res.json({
      success: true,
      message: "PDF and AI content deleted successfully"
    });

  } catch (error) {
    console.error("Delete PDF error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
