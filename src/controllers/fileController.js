// Show file management page
export const index = async (req, res) => {
  try {
    res.render('file-management', { 
      user: req.user,
      title: 'File Management'
    });
  } catch (error) {
    console.error('Error loading file management page:', error);
    res.status(500).send('Internal Server Error');
  }
}; 