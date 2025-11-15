const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Assuming you already loaded Data_Photos_item_bytes using getPictureItem()
const Data_Photos_item_bytes = new Map();

/**
 * Loads the data file (like in your previous GetPicture_item)
 */
function loadPictureItems() {
  const filePath = path.join(__dirname, 'Talk.dat');

  if (!fs.existsSync(filePath)) {
    return;
  }

  const byteArray = fs.readFileSync(filePath);
  let num = 0;

  while (num < byteArray.length) {
    try {
      const id = byteArray.readUInt16LE(num);
      num += 2;
      const type = byteArray.readUInt8(num);
      num += 1;
      const len = byteArray.readUInt16LE(num);
      num += 2;
      const photo = byteArray.slice(num, num + len);
      num += len;

      Data_Photos_item_bytes.set(id, { _id: id, _type: type, _len: len, _photo: photo });

      switch (id) {
        case 8914:
          Data_Photos_item_bytes.set(10000, { _id: 10000, _type: type, _len: len, _photo: photo });
          break;
        case 8924:
          Data_Photos_item_bytes.set(17001, { _id: 17001, _type: type, _len: len, _photo: photo });
          break;
        case 14002:
          Data_Photos_item_bytes.set(18001, { _id: 18001, _type: type, _len: len, _photo: photo });
          break;
      }
    } catch (err) {
      break;
    }
  }
}

/**
 * Converts stored bytes into an image using Sharp.
 * Replaces pure green (#00FF00) with transparency.
 */
async function getPhotoItem(id, outputFolder = 'output') {
  if (!Data_Photos_item_bytes.has(id)) {
    return;
  }

  const { _photo } = Data_Photos_item_bytes.get(id);

  // Ensure output folder exists
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  const outputPath = path.join(outputFolder, `photo_${id}.png`);

  // Convert photo bytes to image and make green transparent
  await sharp(_photo)
    .png()
    .ensureAlpha()
    .toColourspace('rgba')
    .toBuffer()
    .then(async (imgBuffer) => {
      // Create transparency for green pixels (#00FF00)
      const image = sharp(imgBuffer);
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

      // Replace green pixels with transparency
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r === 0 && g === 255 && b === 0) {
          data[i + 3] = 0; // alpha = 0
        }
      }

      await sharp(data, {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4
        }
      })
        .png()
        .toFile(outputPath);
    })
    .catch((err) => {
      // Failed to process image
    });
}

// --- Example usage ---
(async () => {
  loadPictureItems();

  // Example: extract and convert photo with ID 10000
  await getPhotoItem(10000);
})();
