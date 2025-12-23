const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const cropPdf = async (req, res) => {
  try {
    const filePath = req.file.path;
    const crop = JSON.parse(req.body.crop);

    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    pdfDoc.getPages().forEach((page) => {
      const { width, height } = page.getSize();

      const left = Math.max(0, crop.left);
      const bottom = Math.max(0, crop.bottom);
      const cropWidth = Math.max(1, width - crop.left - crop.right);
      const cropHeight = Math.max(1, height - crop.top - crop.bottom);

      page.setCropBox(left, bottom, cropWidth, cropHeight);
    });

    const outPath = path.join("output", `cropped-${Date.now()}.pdf`);
    fs.writeFileSync(outPath, await pdfDoc.save());

    res.download(outPath, () => {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Crop failed" });
  }
};

module.exports = { cropPdf };
