const fs = require('fs');
const path = require('path');

// Helper function to convert byte array to hex string
function bytesToHexString(bytes) {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to convert hex string to integer
function hexToInt(hexString) {
  return parseInt(hexString, 16);
}

// Helper function to extract byte array from buffer
function byteArrayToByteArray(buffer, offset, length) {
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push(buffer[offset + i]);
  }
  return result;
}

function loadDataWarps() {
  console.log('Loading warp.dat...');
  
  const filePath = path.join(__dirname, '', 'Warp.Dat');
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.error('Please make sure the file exists at: /warp.chi');
    process.exit(1);
  }
  
  // Read file as buffer
  const array = fs.readFileSync(filePath);
  
  // Calculate number of entries (skip first 23 bytes, so start from index 1)
  const num = Math.floor(array.length / 23) - 1;
  
  const dataWarps = {}; // i -> num2
  const dataWarpsQuestID = {}; // key -> i
  const dataWarpsMapID = {}; // num2 -> i
  
  for (let i = 1; i <= num; i++) {
    try {
      // Extract 23 bytes starting from i * 23
      const array2 = byteArrayToByteArray(array, i * 23, 23);
      
      // Extract num2: bytes at positions 11-12 (0-indexed: array2[11], array2[12])
      // Convert to hex, XOR with 0xC1 and 9, convert to int, subtract 1
      const bytes1 = [array2[12], array2[11]]; // Note: C# uses [12, 11] order
      const hex1 = bytesToHexString(bytes1);
      const num2 = (hexToInt(hex1) ^ 0xC1 ^ 9) - 1;
      
      // Extract key: bytes at positions 13-14 (0-indexed: array2[13], array2[14])
      // Convert to hex, XOR with 0x5200 and 9, convert to int, subtract 1
      const bytes2 = [array2[14], array2[13]]; // Note: C# uses [14, 13] order
      const hex2 = bytesToHexString(bytes2);
      const key = (hexToInt(hex2) ^ 0x5200 ^ 9) - 1;
      
      // Store in dictionaries
      dataWarps[i] = num2;
      dataWarpsQuestID[key] = i;
      dataWarpsMapID[num2] = i;
    } catch (ex) {
      console.error(`Error processing entry ${i}:`, ex.message);
    }
  }
  
  // Create output data structure
  const output = {
    Data_Warps: dataWarps,
    Data_Warps_QuestID: dataWarpsQuestID,
    Data_Warps_MapID: dataWarpsMapID,
    totalEntries: num,
    generatedAt: new Date().toISOString()
  };
  
  // Save to JSON file in same folder
  const outputPath = path.join(__dirname, '', 'warp-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
  
  console.log(`\nSuccessfully processed ${num} warp entries`);
  console.log(`Data saved to: ${outputPath}`);
  console.log(`\nSummary:`);
  console.log(`  Data_Warps entries: ${Object.keys(dataWarps).length}`);
  console.log(`  Data_Warps_QuestID entries: ${Object.keys(dataWarpsQuestID).length}`);
  console.log(`  Data_Warps_MapID entries: ${Object.keys(dataWarpsMapID).length}`);
  
  return output;
}

// Run the function
if (require.main === module) {
  try {
    loadDataWarps();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

module.exports = { loadDataWarps };

