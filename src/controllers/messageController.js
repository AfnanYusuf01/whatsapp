// Show messages page
export const index = async (req, res) => {
  try {
    res.render('messages', { 
      user: req.user,
      title: 'Message Management'
    });
  } catch (error) {
    console.error('Error loading messages page:', error);
    res.status(500).send('Internal Server Error');
  }
}; 