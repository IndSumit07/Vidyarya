import PDF from '../models/pdf.model.js';
import cloudinary from '../config/cloudinary.config.js';

// Upload PDF
export const uploadPDF = async (req, res) => {
  try {
    console.log('PDF Upload - Request body:', req.body);
    console.log('PDF Upload - Request file:', req.file);
    console.log('PDF Upload - Request cookies:', req.cookies);
    console.log('PDF Upload - User ID from body:', req.body.userId);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const { title, description, subject, tags, isPublic } = req.body;
    const userId = req.body.userId;

    if (!userId) {
      console.log('PDF Upload - No user ID found');
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    console.log('PDF Upload - Proceeding with user ID:', userId);

    // Check Cloudinary configuration
    console.log('PDF Upload - Cloudinary config check:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
    });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('PDF Upload - Cloudinary environment variables not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'PDF upload service not configured. Please contact administrator.' 
      });
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        resource_type: 'raw',
        folder: 'vidyarya/pdfs',
        format: 'pdf',
        public_id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }, (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload to Cloudinary: ' + error.message));
        } else {
          console.log('PDF Upload - Cloudinary upload successful:', result);
          resolve(result);
        }
      });
      
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    const newPDF = new PDF({
      title: title || req.file.originalname.replace('.pdf', ''),
      description: description || '',
      originalName: req.file.originalname,
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      subject: subject || 'General',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: userId,
      isPublic: isPublic === 'true'
    });

    await newPDF.save();
    console.log('PDF Upload - PDF saved to database successfully');

    res.status(201).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: newPDF
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error uploading PDF';
    if (error.message.includes('Cloudinary')) {
      errorMessage = 'Error uploading to cloud storage. Please try again.';
    } else if (error.message.includes('database')) {
      errorMessage = 'Error saving PDF information. Please try again.';
    } else {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all PDFs
export const getAllPDFs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', subject = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    const pdfs = await PDF.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PDF.countDocuments(query);

    res.status(200).json({
      success: true,
      data: pdfs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching PDFs',
      error: error.message
    });
  }
};

// Get PDF by ID
export const getPDFById = async (req, res) => {
  try {
    const { id } = req.params;
    const pdf = await PDF.findById(id).populate('uploadedBy', 'name email');

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    pdf.viewCount += 1;
    await pdf.save();

    res.status(200).json({
      success: true,
      data: pdf
    });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching PDF',
      error: error.message
    });
  }
};

// Download PDF
export const downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const pdf = await PDF.findById(id);

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    pdf.downloadCount += 1;
    await pdf.save();

    res.redirect(pdf.cloudinaryUrl);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading PDF',
      error: error.message
    });
  }
};

// Update PDF
export const updatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, tags, isPublic } = req.body;
    const userId = req.body.userId;

    const pdf = await PDF.findById(id);

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    if (pdf.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own PDFs'
      });
    }

    const updatedPDF = await PDF.findByIdAndUpdate(
      id,
      {
        title,
        description,
        subject,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isPublic: isPublic === 'true'
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'PDF updated successfully',
      data: updatedPDF
    });
  } catch (error) {
    console.error('Error updating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating PDF',
      error: error.message
    });
  }
};

// Delete PDF
export const deletePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;

    const pdf = await PDF.findById(id);

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    if (pdf.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own PDFs'
      });
    }

    try {
      await cloudinary.uploader.destroy(pdf.cloudinaryPublicId, { resource_type: 'raw' });
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
    }

    await PDF.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'PDF deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting PDF',
      error: error.message
    });
  }
};

// Get user's PDFs
export const getUserPDFs = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const pdfs = await PDF.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PDF.countDocuments({ uploadedBy: userId });

    res.status(200).json({
      success: true,
      data: pdfs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user PDFs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user PDFs',
      error: error.message
    });
  }
};
