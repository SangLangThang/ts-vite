const fs = require('fs');
const path = require('path');

// Main function to create item images
function createItemImages() {
  const itemsOutputPath = path.join(__dirname, 'items-output.json');
  const itemsDataPath = path.join(__dirname, 'items-data-talkvn.json');
  const outputDir = path.join(__dirname, 'item-images');

  // Check if files exist
  if (!fs.existsSync(itemsOutputPath)) {
    return;
  }

  if (!fs.existsSync(itemsDataPath)) {
    return;
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read JSON files
  const itemsOutput = JSON.parse(fs.readFileSync(itemsOutputPath, 'utf8'));
  const itemsData = JSON.parse(fs.readFileSync(itemsDataPath, 'utf8'));

  // Create a map for quick lookup of picture data by _idPic
  const pictureMap = new Map();
  itemsData.forEach(item => {
    if (item._id && item._photo) {
      pictureMap.set(item._id, item._photo);
    }
  });

  // Process each item and create PNG images
  let successCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  itemsOutput.forEach((item, index) => {
    try {
      const itemId = item._id;
      const idPic = item._idPic;

      if (!itemId || !idPic) {
        return; // Skip if missing required fields
      }

      // Look up the picture data using idPic
      const photoBase64 = pictureMap.get(idPic);

      if (!photoBase64) {
        notFoundCount++;
        return;
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(photoBase64, 'base64');

      // Create filename: item_<itemId>.png
      const filename = `item_${itemId}.png`;
      const filepath = path.join(outputDir, filename);

      // Write PNG file
      fs.writeFileSync(filepath, imageBuffer);

      successCount++;
    } catch (error) {
      errorCount++;
    }
  });
}

// Run the script
try {
  createItemImages();
} catch (error) {
  // Fatal error
}
