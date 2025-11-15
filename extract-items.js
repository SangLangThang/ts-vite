const fs = require('fs');
const path = require('path');

// Main function to extract item data
function getPictureItem() {
  const filePath = path.join(__dirname, 'TalkVN.dat');
  const outputJsonPath = path.join(__dirname, 'items-data.json');

  // Check if Talk.Dat exists
  if (!fs.existsSync(filePath)) {
    return;
  }

  // Read the entire file
  const byteArray = fs.readFileSync(filePath);

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

      // Handle special ID mappings from original C# code
      switch (id) {
        case 8914: {
          // Also add as 10000
          const mappedData = { ...itemData, _id: 10000 };
          itemsArray.push(mappedData);
          break;
        }
        case 8924: {
          // Also add as 17001
          const mappedData = { ...itemData, _id: 17001 };
          itemsArray.push(mappedData);
          break;
        }
        case 14002: {
          // Also add as 18001
          const mappedData = { ...itemData, _id: 18001 };
          itemsArray.push(mappedData);
          break;
        }
      }

    } catch (error) {
      // End of file or error - stop parsing
      break;
    }
  }

  // Save to JSON file
  fs.writeFileSync(outputJsonPath, JSON.stringify(itemsArray, null, 2));
}

// Run the extraction
try {
  getPictureItem();
} catch (error) {
  // Error during extraction
}
