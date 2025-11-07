const fs = require('fs');
const path = require('path');

// Main function to create item images
function createItemImages() {
  const itemsOutputPath = path.join(__dirname, 'items-output.json');
  const itemsDataPath = path.join(__dirname, 'items-data-talkvn.json');
  const outputDir = path.join(__dirname, 'item-images');

  // Check if files exist
  if (!fs.existsSync(itemsOutputPath)) {
    console.error(`Error: File not found: ${itemsOutputPath}`);
    return;
  }

  if (!fs.existsSync(itemsDataPath)) {
    console.error(`Error: File not found: ${itemsDataPath}`);
    return;
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  // Read JSON files
  console.log('Loading JSON files...');
  const itemsOutput = JSON.parse(fs.readFileSync(itemsOutputPath, 'utf8'));
  const itemsData = JSON.parse(fs.readFileSync(itemsDataPath, 'utf8'));

  console.log(`Loaded ${itemsOutput.length} items from items-output.json`);
  console.log(`Loaded ${itemsData.length} items from items-data-talkvn.json`);

  // Create a map for quick lookup of picture data by _idPic
  const pictureMap = new Map();
  itemsData.forEach(item => {
    if (item._id && item._photo) {
      pictureMap.set(item._id, item._photo);
    }
  });

  console.log(`Created picture map with ${pictureMap.size} entries\n`);

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
        if (notFoundCount <= 10) {
          console.log(`[WARN] No picture found for item ${itemId} (idPic: ${idPic})`);
        }
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
      if (successCount % 100 === 0) {
        console.log(`Created ${successCount} images...`);
      }

    } catch (error) {
      errorCount++;
      if (errorCount <= 10) {
        console.error(`[ERROR] Failed to create image for item ${item._id}:`, error.message);
      }
    }
  });

  console.log(`\n===== Image Generation Complete =====`);
  console.log(`Successfully created: ${successCount} images`);
  console.log(`Picture not found: ${notFoundCount} items`);
  console.log(`Errors: ${errorCount} items`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`======================================`);
}

// Run the script
console.log('===== Item Image Creator =====');
console.log('Creating PNG images from item data...\n');

try {
  createItemImages();
} catch (error) {
  console.error('Fatal error:', error);
}
