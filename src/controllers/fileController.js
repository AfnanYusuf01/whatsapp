import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Show file management page
export const index = async (req, res) => {
  try {
    res.render("file-management", {
    layout: 'layouts/dashboard', // relatif terhadap folder 'views'
    footer: true,
      title: 'Manajemen File',
      user: req.user
    });
  } catch (error) {
    console.error('Error loading file management page:', error);
    res.status(500).send('Internal Server Error');
  }
};

