const fs = require('fs');
const path = require('path');

// Main function to extract item data
function getPictureItem() {
  const filePath = path.join(__dirname, 'TalkVN.dat');
  const outputJsonPath = path.join(__dirname, 'items-data.json');

  // Check if Talk.Dat exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    console.log('Please ensure Talk.Dat is in the same folder as this script.');
    return;
  }

  // Read the entire file
  const byteArray = fs.readFileSync(filePath);
  console.log(`Loaded file: ${filePath} (${byteArray.length} bytes)`);

  let num = 0;
  let itemCount = 0;
  const itemsArray = [];

  // Parse the file
  while (num < byteArray.length) {
    try {
      // Read ID (2 bytes, unsigned 16-bit little-endian)
      const id = byteArray.readUInt16LE(num);
      num += 2;

      // Read Type (1 byte, unsigned 8-bit)
      const type = byteArray.readUInt8(num);
      num += 1;

      // Read Length (2 bytes, unsigned 16-bit little-endian)
      const len = byteArray.readUInt16LE(num);
      num += 2;

      // Read Photo data (slice the buffer)
      const photo = byteArray.slice(num, num + len);
      num += len;

      // Store the data (convert photo to base64 for easy viewing)
      const itemData = {
        _id: id,
        _type: type,
        _len: len,
        _photo: photo.toString('base64') // Convert to base64
      };

      // Add to array (store ALL items, just like C# does)
      itemsArray.push(itemData);
      itemCount++;

      if (id > 0 && len > 0) {
        console.log(`[${itemCount}] Extracted item ${id} (type: ${type}, size: ${len} bytes)`);
      }

      // Handle special ID mappings from original C# code
      switch (id) {
        case 8914: {
          // Also add as 10000
          const mappedData = { ...itemData, _id: 10000 };
          itemsArray.push(mappedData);
          console.log(`    -> Also added as item 10000`);
          break;
        }
        case 8924: {
          // Also add as 17001
          const mappedData = { ...itemData, _id: 17001 };
          itemsArray.push(mappedData);
          console.log(`    -> Also added as item 17001`);
          break;
        }
        case 14002: {
          // Also add as 18001
          const mappedData = { ...itemData, _id: 18001 };
          itemsArray.push(mappedData);
          console.log(`    -> Also added as item 18001`);
          break;
        }
      }

    } catch (error) {
      // End of file or error - stop parsing
      console.log(`\nFinished parsing at offset ${num}`);
      if (error.message) {
        console.log(`Reason: ${error.message}`);
      }
      break;
    }
  }

  // Save to JSON file
  fs.writeFileSync(outputJsonPath, JSON.stringify(itemsArray, null, 2));

  console.log(`\n===== Extraction Complete =====`);
  console.log(`Total items extracted: ${itemCount}`);
  console.log(`Output file: ${outputJsonPath}`);
  console.log(`===============================`);
}

// Run the extraction
console.log('===== Item Data Extractor =====');
console.log('Extracting item data from Talk.Dat...\n');

try {
  getPictureItem();
} catch (error) {
  console.error('Error during extraction:', error);
}
