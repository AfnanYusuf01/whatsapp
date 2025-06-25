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

// Show device settings page
export const showSettings = async (req, res) => {
  try {
    const deviceId = req.params.id;
    
    res.render('device-settings', {
      title: 'Device Settings',
      user: req.user,
      deviceId: deviceId
    });
  } catch (error) {
    console.error('Error loading device settings page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Show messages page
export const showMessages = async (req, res) => {
  try {
    res.render('messages', {
      title: 'Send Messages',
      user: req.user
    });
  } catch (error) {
    console.error('Error loading messages page:', error);
    res.status(500).send('Internal Server Error');
  }
}; 