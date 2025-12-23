const fs = require("fs-extra");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const path = require("path");

exports.imagesToPdf = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const pdfDoc = await PDFDocument.create();

    for (const img of req.files) {
      const buffer = await fs.readFile(img.path);
      const processed = await sharp(buffer).png({ quality: 100 }).toBuffer();
      const pdfImage = await pdfDoc.embedPng(processed);
      const { width, height } = pdfImage.scale(1);
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(pdfImage, { x: 0, y: 0, width, height });
      await fs.remove(img.path);
    }

    await fs.ensureDir("output");
    const outputPath = `output/images_${Date.now()}.pdf`;
    await fs.writeFile(outputPath, await pdfDoc.save());

    res.download(outputPath, "images.pdf", async () => {
      await fs.remove(outputPath);
    });

  } catch (err) {
    console.error("Images to PDF Error:", err);
    res.status(500).json({ error: "Failed to convert images to PDF" });
  }
};
