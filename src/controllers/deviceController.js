// Show device management page
export const index = async (req, res) => {
  try {
    res.render('device', {
      title: 'Device Management',
      user: req.user
    });
  } catch (error) {
    console.error('Error loading device management page:', error);
    res.status(500).send('Internal Server Error');
  }
}; 