const fs = require('fs');
const path = require('path');

// Helper functions to mimic the C# API methods
const API = {
  // Convert byte array portion to new array
  ByteArrayToByteArray: (source, offset, length) => {
    return Buffer.from(source.slice(offset, offset + length));
  },

  // Get item ID from 2 bytes
  GetIdItem: (data) => {
    if (data.length < 2) return 0;
    return (data.readUInt16LE(0) ^ 0xefc3) - 9;
  },

  // Get item level
  GetLVItem: (data) => {
    if (data.length < 1) return 0;
    return (data[0] ^ 0x9a) - 9;
  },

  // Get item price
  GetGiaItem: (data) => {
    if (data.length < 4) return 0;
    return (data.readUInt32LE(0) ^ 0xf4b4f4b4) - 10909;
  },

  // Get value from 2 bytes
  GetValue5Item: (data) => {
    if (data.length < 2) return 0;
    return (data.readUInt16LE(0) ^ 0xefc3) - 9;
  },

  // Get name from byte array (null-terminated string)
  GetNameItem: (data) => {
    let name = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i] === 0) break;
      name += String.fromCharCode(data[i]);
    }
    return name;
  },

  // Convert bytes to hex string
  bytestohexstring: (bytes) => {
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
};

// Helper function to decrypt picture ID
function _EFC3(data) {
  if (data.length < 2) return 0;
  return (data.readUInt16LE(0) ^ 0xefc3) - 9;
}

// Main function to parse item.dat
function parseItemDat() {
  const filePath = path.join(__dirname, 'data', 'item.dat');
  const outputJsonPath = path.join(__dirname, 'items-output.json');

  // Check if item.dat exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    console.log('Please ensure item.dat is in the data folder.');
    return;
  }

  // Read the entire file
  const array15 = fs.readFileSync(filePath);
  console.log(`Loaded file: ${filePath} (${array15.length} bytes)`);

  const Data_Items = [];
  let itemCount = 0;
  const itemSize = 370; // Each item is 370 bytes

  // Parse the file in chunks of 370 bytes
  for (let l = 0; l < array15.length; l += itemSize) {
    try {
      // Extract 370 bytes for this item
      const array16 = API.ByteArrayToByteArray(array15, l, itemSize);

      // Get item ID (offset 22, 2 bytes)
      const data5 = API.ByteArrayToByteArray(array16, 22, 2);
      const idItem2 = API.GetIdItem(data5);

      // Skip if invalid ID
      if (idItem2 <= 0) {
        continue;
      }

      // Extract various byte arrays from the item data
      const array17 = API.ByteArrayToByteArray(array16, 0, 1);
      const data6 = API.ByteArrayToByteArray(array16, 1, 20); // Name data
      const array18 = API.ByteArrayToByteArray(array16, 21, 1); // Type_2
      const idPic2 = _EFC3(API.ByteArrayToByteArray(array16, 24, 2)); // Picture ID
      const array19 = API.ByteArrayToByteArray(array16, 32, 2); // Type for value1
      const array20 = API.ByteArrayToByteArray(array16, 38, 4); // Value1 data
      const array21 = API.ByteArrayToByteArray(array16, 34, 4); // Type for value2
      const array22 = API.ByteArrayToByteArray(array16, 42, 5); // Value2 data
      const data7 = API.ByteArrayToByteArray(array16, 88, 4); // Price
      const array23 = API.ByteArrayToByteArray(array16, 98, 1); // tt (time type?)
      const array24 = API.ByteArrayToByteArray(array16, 99, 2); // Time value
      const array25 = API.ByteArrayToByteArray(array16, 48, 1); // Loai (category)
      const array26 = API.ByteArrayToByteArray(array16, 49, 1); // Type
      const data8 = API.ByteArrayToByteArray(array16, 83, 1); // Level
      const array27 = API.ByteArrayToByteArray(array16, 116, array16.length - 116); // Description
      const data9 = API.ByteArrayToByteArray(array16, 103, 2); // IdBua

      // Get name
      let name = API.GetNameItem(data6);

      // Get level
      const lVItem2 = API.GetLVItem(data8);

      // Initialize stats
      let num22 = 0; // HP
      let num23 = 0; // SP
      let int2 = 0; // INT
      let atk2 = 0; // ATK
      let def2 = 0; // DEF
      let hpx2 = 0; // HPX
      let spx2 = 0; // SPX
      let agi2 = 0; // AGI
      let fai2 = 0; // FAI
      let num24 = 0; // INT2
      let num25 = 0; // ATK2
      let num26 = 0; // DEF2
      let num27 = 0; // HPX2
      let num28 = 0; // SPX2
      let num29 = 0; // AGI2
      let num30 = 0; // FAI2
      let num31 = 0;
      let num32 = 0;
      let num33 = 0;
      let num34 = 0;

      // Decrypt first value
      const num35 = (parseInt(API.bytestohexstring([array20[1], array20[0]]), 16) ^ 0xf4b4) - 109;
      const typeValue1 = parseInt(API.bytestohexstring([array19[1], array19[0]]), 16) ^ 0xefca;

      // Assign first value based on type
      switch (typeValue1) {
        case 209:
          hpx2 = num35;
          break;
        case 208:
          spx2 = num35;
          break;
        case 212:
          int2 = num35;
          break;
        case 210:
          atk2 = num35;
          break;
        case 213:
          def2 = num35;
          break;
        case 234:
          num31 = num35;
          break;
        case 237:
          num32 = num35;
          break;
        case 214:
          agi2 = num35;
          break;
        case 43:
          num22 = num35;
          break;
        case 42:
          num23 = num35;
          break;
        case 64:
          fai2 = num35;
          break;
      }

      // Decrypt second value
      const num36 = (parseInt(API.bytestohexstring([array22[1], array22[0]]), 16) ^ 0xf4b4) - 109;
      const typeValue2 = parseInt(API.bytestohexstring([array21[1], array21[0]]), 16) ^ 0xefca;

      // Assign second value based on type
      switch (typeValue2) {
        case 209:
          num27 = num36;
          break;
        case 208:
          num28 = num36;
          break;
        case 212:
          num24 = num36;
          break;
        case 210:
          num25 = num36;
          break;
        case 213:
          num26 = num36;
          break;
        case 234:
          num33 = num36;
          break;
        case 237:
          num34 = num36;
          break;
        case 214:
          num29 = num36;
          break;
        case 43:
          num22 += num36;
          break;
        case 42:
          num23 += num36;
          break;
        case 64:
          num30 = num36;
          break;
      }

      // Time type
      const num37 = (array23[0] ^ 0x9a) - 9;
      let num38 = 0;
      if (num37 > 0) {
        num38 = (parseInt(API.bytestohexstring([array24[1], array24[0]]), 16) ^ 0xf4b4) - 109;
      }

      // Category
      const loai2 = (array25[0] ^ 0x9a) - 9;

      const type = (array26[0] ^ 0x9a) - 9;

      // Extract description (reverse order, skip null bytes)
      let text5 = '';
      for (let n = array27.length - 1; n >= 0; n--) {
        if (array27[n] > 0) {
          text5 += String.fromCharCode(array27[n]);
        }
      }

      // Create item object
      const item = {
        _id: idItem2,
        _idPic: idPic2,
        _loai2: loai2,
        _type: type
      };

      Data_Items.push(item);
      itemCount++;

      if (itemCount % 100 === 0) {
        console.log(`Processed ${itemCount} items...`);
      }
    } catch (error) {
      console.log(`Error at offset ${l}:`, error.message);
      break;
    }
  }

  // Save to JSON file
  fs.writeFileSync(outputJsonPath, JSON.stringify(Data_Items, null, 2));

  console.log(`\n===== Extraction Complete =====`);
  console.log(`Total items extracted: ${itemCount}`);
  console.log(`Output file: ${outputJsonPath}`);
  console.log(`===============================`);

  // Display first few items as sample
  if (Data_Items.length > 0) {
    console.log(`\nSample items (first 3):`);
    console.log(JSON.stringify(Data_Items.slice(0, 3), null, 2));
  }
}

// Run the extraction
console.log('===== Item.dat Parser =====');
console.log('Parsing item data from item.dat...\n');

try {
  parseItemDat();
} catch (error) {
  console.error('Error during parsing:', error);
}
