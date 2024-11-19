const express = require('express');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // UUID for unique identifiers

const app = express();
const port = 9000;
const cron = require('node-cron');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file upload handling
const upload = multer({ dest: uploadsDir });

// Route for uploading OpenAPI specs
app.post('/upload', upload.single('openapi'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  if (!['application/json', 'text/json'].includes(req.file.mimetype)) {
    return res.status(400).send(`Only JSON files are allowed, got ${req.file.mimetype}`);
  }

  // Generate a unique destination file path with .json extension
  const uniqueName = uuidv4() + '.json';
  const destPath = path.join(uploadsDir, uniqueName);

  try {
    // Rename and add JSON extension if needed
    fs.renameSync(req.file.path, destPath);

    // Read the uploaded file and parse it as JSON
    const openApiSpec = JSON.parse(fs.readFileSync(destPath, 'utf8'));

    // Serve the uploaded spec on a unique route
    const specPath = `/spec/${uniqueName}`;
    app.use(specPath, swaggerUi.serve, swaggerUi.setup(openApiSpec));

    // Return the URL where the Swagger UI is accessible
    // Note: in a Docker deployment, the address of the host is not
    // necessarily 'localhost', so we use the X-Forwarded-For header
    // to get the address of the client.
    const forwardedFor = req.headers['x-forwarded-for'];
    const host = forwardedFor ? forwardedFor.split(',')[0].trim() : 'localhost';
    res.send(`http://${host}:${port}${specPath}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to process the OpenAPI spec.');
  }
});

// Clean up old files
const cleanupOldFiles = () => {
  // Get a list of all files in the uploads directory
  const files = fs.readdirSync(uploadsDir);

  // Remove any files older than 1 day
  files.forEach((file) => {
    const filePath = path.join(uploadsDir, file);
    const fileStats = fs.statSync(filePath);
    const oneDayInMs = 1000 * 60 * 60 * 24;
    // const oneDayInMs = 1000 * 60;
    if (Date.now() - fileStats.mtimeMs > oneDayInMs) {
      fs.unlinkSync(filePath);
    }
  });
};

// Set up a route to clean up old files
app.get('/cleanup', (req, res) => {
  cleanupOldFiles();
  res.send('Old files cleaned up.');
});

cron.schedule('*/2 * * * *', () => {
  cleanupOldFiles();
  console.log('running a task every two minutes');
});

// Start the server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

module.exports = app;


