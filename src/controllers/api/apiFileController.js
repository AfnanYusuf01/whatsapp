import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const WHATSAPP_API_BASE_URL = process.env.WHATSAPP_API_URL || 'http://localhost:3000';
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || 'test123';

// Upload file
export const uploadFile = async (req, res) => {
  try {
    console.log('=== UPLOAD FILE START ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('User ID from token:', req.user?.userId);

    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.files.file;
    const { description, expiresIn } = req.body;
    
    // Get userId from logged-in user
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or user ID not found'
      });
    }

    console.log('File info:', {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype
    });

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }

    // Create form data for external API
    const formData = new FormData();
    
    // Append file
    formData.append('file', file.data, {
      filename: file.name,
      contentType: file.mimetype
    });
    
    // Append other fields
    formData.append('userId', userId);
    if (description) {
      formData.append('description', description);
    }
    if (expiresIn) {
      formData.append('expiresIn', expiresIn);
    }

    // Make request to external WhatsApp API
    const response = await axios.post(
      `${WHATSAPP_API_BASE_URL}/api/whatsapp/files/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Origin': WHATSAPP_API_BASE_URL,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        withCredentials: true,
        timeout: 60000 // 60 seconds for file upload
      }
    );

    console.log('Upload successful:', response.data);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error uploading file:', error);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp API service unavailable',
        error: 'Connection refused'
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from WhatsApp API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error connecting to WhatsApp API',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// List files
export const listFiles = async (req, res) => {
  try {
    const response = await axios.get(`${WHATSAPP_API_BASE_URL}/api/whatsapp/files`, {
      headers: { 'X-API-Token': WHATSAPP_API_TOKEN },
    });

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file list',
      error: error.message,
    });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Get userId from logged-in user
    const userId = req.user?.userId;

    console.log('=== DELETE FILE START ===');
    console.log('File ID:', fileId);
    console.log('User ID from token:', userId);

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required in URL path'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or user ID not found'
      });
    }

    // Make request to external WhatsApp API
    const response = await axios.delete(
      `${WHATSAPP_API_BASE_URL}/api/whatsapp/files/${fileId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Origin': WHATSAPP_API_BASE_URL,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        data: { userId },
        withCredentials: true,
        timeout: 30000
      }
    );

    console.log('Delete successful:', response.data);

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting file:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from WhatsApp API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get file stats for current user
export const getFileStats = async (req, res) => {
  try {
    // Get userId from logged-in user
    const userId = req.user?.userId;

    console.log('=== GET FILE STATS START ===');
    console.log('User ID from token:', userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or user ID not found'
      });
    }

    // Make request to external WhatsApp API
    const response = await axios.get(
      `${WHATSAPP_API_BASE_URL}/api/whatsapp/files/users/${userId}/stats`,
      {
        headers: {
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'If-None-Match': 'W/"167-N+fMpHMaZ+Wlwznxce9RkSTSCZQ"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        withCredentials: true,
        timeout: 30000
      }
    );

    console.log('External Stats Response:', response.data);

    // Handle different response structures from external API
    let stats = {};
    if (response.data && typeof response.data === 'object') {
      if (response.data.stats) {
        stats = response.data.stats;
      } else if (response.data.data) {
        stats = response.data.data;
      } else {
        stats = response.data;
      }
    }

    console.log('Processed stats:', stats);

    res.json({
      success: true,
      message: 'File stats retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting file stats:', error);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp API service unavailable',
        error: 'Connection refused',
        data: { totalFiles: 0, totalSize: 0 } // Return default stats as fallback
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from WhatsApp API',
        error: error.response.data,
        data: { totalFiles: 0, totalSize: 0 } // Return default stats as fallback
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error',
        error: 'No response received',
        data: { totalFiles: 0, totalSize: 0 } // Return default stats as fallback
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      data: { totalFiles: 0, totalSize: 0 } // Return default stats as fallback
    });
  }
};

// Get files list for current user
export const getFiles = async (req, res) => {
  try {
    const { sortBy, sortOrder, limit } = req.query;
    
    // Get userId from logged-in user
    const userId = req.user?.userId;

    console.log('=== GET FILES START ===');
    console.log('User ID from token:', userId);
    console.log('Query params:', { sortBy, sortOrder, limit });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or user ID not found'
      });
    }

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('userId', userId);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);
    if (limit) queryParams.append('limit', limit);

    // Make request to external WhatsApp API
    const response = await axios.get(
      `${WHATSAPP_API_BASE_URL}/api/whatsapp/files?${queryParams.toString()}`,
      {
        headers: {
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'If-None-Match': 'W/"5b-6y9c5klLsM9wekClr6SPQQZRxQY"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        withCredentials: true,
        timeout: 30000
      }
    );

    console.log('External API Response:', response.data);

    // Handle different response structures from external API
    let files = [];
    if (response.data && Array.isArray(response.data)) {
      files = response.data;
    } else if (response.data && response.data.files && Array.isArray(response.data.files)) {
      files = response.data.files;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      files = response.data.data;
    } else {
      console.warn('Unexpected external API response structure:', response.data);
      files = [];
    }

    console.log('Processed files array:', files);

    res.json({
      success: true,
      message: 'Files retrieved successfully',
      data: files,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting files:', error);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp API service unavailable',
        error: 'Connection refused',
        data: [] // Return empty array as fallback
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from WhatsApp API',
        error: error.response.data,
        data: [] // Return empty array as fallback
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error',
        error: 'No response received',
        data: [] // Return empty array as fallback
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      data: [] // Return empty array as fallback
    });
  }
};

// Preview file
export const previewFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Get userId from logged-in user
    const userId = req.user?.userId;

    console.log('=== PREVIEW FILE START ===');
    console.log('File ID:', fileId);
    console.log('User ID from token:', userId);

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required in URL path'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or user ID not found'
      });
    }

    // Make request to external WhatsApp API for file preview
    const response = await axios.get(
      `${WHATSAPP_API_BASE_URL}/api/whatsapp/files/${fileId}/preview`,
      {
        headers: {
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        params: { userId },
        withCredentials: true,
        timeout: 30000,
        responseType: 'stream' // For file streaming
      }
    );

    console.log('Preview successful for file:', fileId);

    // Forward the file stream to the client
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', response.headers['content-length']);
    res.setHeader('Content-Disposition', response.headers['content-disposition'] || 'inline');
    
    response.data.pipe(res);

  } catch (error) {
    console.error('Error previewing file:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from WhatsApp API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
