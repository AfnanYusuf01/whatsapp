import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Show all contacts for current user (main page)
export const index = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { user_id: req.user.id },
      include: {
        tag: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const tags = await prisma.contactTag.findMany({
      where: { user_id: req.user.id },
      select: { id: true, name: true }
    });

    console.log('[index] req.user:', req.user);
    console.log('[index] res.locals.user:', res.locals.user);

    res.render('crud/contact-management', { 
      contacts,
      tags,
      user: req.user,
      title: 'Contact Management'
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Get contact data for modal (AJAX)
export const show = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await prisma.contact.findFirst({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      },
      include: {
        tag: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ contact });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Store new contact (AJAX)
export const store = async (req, res) => {
  try {
    console.log('=== STORE CONTACT START ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id);
    
    const { name, phone, email, notes, tag_id } = req.body;

    // Debug: Log the received data
    console.log('Create request data:', { name, phone, email, notes, tag_id });
    console.log('User ID:', req.user.id);

    // Validate required fields
    if (!name || !phone) {
      console.log('Validation failed - missing required fields:', { name, phone });
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required fields'
      });
    }

    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        notes: notes ? notes.trim() : null,
        user_id: req.user.id,
        tag_id: tag_id ? parseInt(tag_id) : null,
        updated_at: new Date()
      },
      include: {
        tag: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      }
    });

    console.log('Contact created successfully:', contact);

    res.json({ 
      success: true, 
      message: 'Contact created successfully',
      contact 
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating contact',
      error: error.message 
    });
  }
};

// Update contact (AJAX)
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes, tag_id } = req.body;

    // Debug: Log the received data
    console.log('=== UPDATE CONTACT START ===');
    console.log('Update request data:', { id, name, phone, email, notes, tag_id });
    console.log('User ID:', req.user.id);
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);

    // Check if this is an import request that got misrouted
    if (id === 'import') {
      console.log('❌ IMPORT REQUEST MISROUTED TO UPDATE FUNCTION!');
      return res.status(400).json({
        success: false,
        message: 'Import request was misrouted. Please try again.'
      });
    }

    // Validate required fields
    if (!name || !phone) {
      console.log('Validation failed - missing required fields:', { name, phone });
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required fields'
      });
    }

    // First check if contact exists and belongs to user
    const existingContact = await prisma.contact.findFirst({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      }
    });

    if (!existingContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or you do not have permission to edit it'
      });
    }

    // Update the contact using update() instead of updateMany()
    const updatedContact = await prisma.contact.update({
      where: { 
        id: parseInt(id)
      },
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        notes: notes ? notes.trim() : null,
        tag_id: tag_id ? parseInt(tag_id) : null,
        updated_at: new Date()
      },
      include: {
        tag: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      }
    });

    console.log('Contact updated successfully:', updatedContact);

    res.json({ 
      success: true, 
      message: 'Contact updated successfully',
      contact: updatedContact 
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating contact',
      error: error.message 
    });
  }
};

// Delete contact (AJAX)
export const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contact.deleteMany({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      }
    });

    res.json({ 
      success: true, 
      message: 'Contact deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting contact',
      error: error.message 
    });
  }
};

// Legacy methods for compatibility (redirect to index)
export const create = (req, res) => res.redirect('/dashboard/contacts');
export const edit = (req, res) => res.redirect('/dashboard/contacts');

// Import contacts from CSV
export const importCSV = async (req, res) => {
  try {
    console.log('=== CSV IMPORT START ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('User ID:', req.user.id);

    if (!req.files || !req.files.csv_file) {
      console.log('No CSV file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
    }

    const csvFile = req.files.csv_file;
    const skipDuplicates = req.body.skip_duplicates === 'on';

    console.log('CSV file info:', {
      name: csvFile.name,
      size: csvFile.size,
      mimetype: csvFile.mimetype
    });

    // Check file size (5MB limit)
    if (csvFile.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }

    // Check file type
    if (!csvFile.mimetype.includes('csv') && !csvFile.name.endsWith('.csv')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Please upload a CSV file.'
      });
    }

    // Parse CSV content
    const csvContent = csvFile.data.toString('utf-8');
    console.log('CSV content (first 500 chars):', csvContent.substring(0, 500));
    
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    console.log('Total lines after filtering:', lines.length);
    
    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty or has no data rows.'
      });
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    console.log('Parsed headers:', headers);
    
    const requiredFields = ['name', 'phone'];
    
    // Validate headers
    for (const field of requiredFields) {
      if (!headers.includes(field)) {
        console.log(`Missing required field: ${field}`);
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // Process data rows
    const dataRows = lines.slice(1);
    let importedCount = 0;
    let skippedCount = 0;
    const errors = [];

    console.log('Processing data rows:', dataRows.length);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      console.log(`Processing row ${i + 2}:`, row);
      
      // Handle CSV with quotes and commas inside fields
      const values = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (let j = 0; j < row.length; j++) {
        const char = row[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim()); // Add the last value
      
      console.log(`Row ${i + 2} parsed values:`, values);
      
      if (values.length < headers.length) {
        const error = `Row ${i + 2}: Insufficient columns (expected ${headers.length}, got ${values.length})`;
        console.log(error);
        errors.push(error);
        continue;
      }

      // Create object from row data
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });

      console.log(`Row ${i + 2} parsed data:`, rowData);

      // Validate required fields
      if (!rowData.name || !rowData.phone) {
        const error = `Row ${i + 2}: Missing required fields (name: "${rowData.name}", phone: "${rowData.phone}")`;
        console.log(error);
        errors.push(error);
        continue;
      }

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = rowData.phone.replace(/[\s\-\(\)]/g, '');
      console.log(`Row ${i + 2} cleaned phone:`, cleanPhone);
      
      // Check for duplicates if skip_duplicates is enabled
      if (skipDuplicates) {
        const existingContact = await prisma.contact.findFirst({
          where: {
            phone: cleanPhone,
            user_id: req.user.id
          }
        });
        
        if (existingContact) {
          console.log(`Row ${i + 2}: Skipping duplicate phone ${cleanPhone}`);
          skippedCount++;
          continue;
        }
      }

      try {
        // Handle tag creation/lookup
        let tagId = null;
        if (rowData.tag_name && rowData.tag_name.trim()) {
          const tagName = rowData.tag_name.trim();
          console.log(`Row ${i + 2}: Processing tag "${tagName}"`);
          
          // Find existing tag or create new one
          let tag = await prisma.contactTag.findFirst({
            where: {
              name: tagName,
              user_id: req.user.id
            }
          });

          if (!tag) {
            console.log(`Row ${i + 2}: Creating new tag "${tagName}"`);
            tag = await prisma.contactTag.create({
              data: {
                name: tagName,
                user_id: req.user.id,
                updated_at: new Date()
              }
            });
          } else {
            console.log(`Row ${i + 2}: Using existing tag "${tagName}" (ID: ${tag.id})`);
          }
          
          tagId = tag.id;
        }

        // Create contact
        const contactData = {
          name: rowData.name.trim(),
          phone: cleanPhone,
          email: rowData.email ? rowData.email.trim() : null,
          notes: rowData.notes ? rowData.notes.trim() : null,
          user_id: req.user.id,
          tag_id: tagId,
          updated_at: new Date()
        };
        
        console.log(`Row ${i + 2}: Creating contact with data:`, contactData);
        
        await prisma.contact.create({
          data: contactData
        });

        console.log(`Row ${i + 2}: Contact created successfully`);
        importedCount++;
      } catch (error) {
        console.error(`Error importing row ${i + 2}:`, error);
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    // Prepare response
    const response = {
      success: true,
      imported_count: importedCount,
      skipped_count: skippedCount,
      total_rows: dataRows.length,
      errors: errors
    };

    console.log('Import completed:', response);

    if (errors.length > 0) {
      response.message = `Import completed with ${errors.length} errors. Check console for details.`;
    } else {
      response.message = `Successfully imported ${importedCount} contacts!`;
    }

    res.json(response);

  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing CSV file',
      error: error.message
    });
  }
}; 