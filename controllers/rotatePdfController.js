const fs = require("fs-extra");
const { PDFDocument, degrees } = require("pdf-lib");

exports.rotatePdf = async (req, res) => {
  try {
    const file = req.file;
    const { angle } = req.body;
    if (!file) return res.status(400).json({ error: "No PDF uploaded" });

    const rotationAngle = parseInt(angle);
    if (![90, 180, 270].includes(rotationAngle))
      return res.status(400).json({ error: "Invalid rotation angle" });

    const pdfBytes = await fs.readFile(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    pdfDoc.getPages().forEach(page => page.setRotation(degrees(rotationAngle)));

    await fs.ensureDir("output");
    const outputPath = `output/rotated_${Date.now()}.pdf`;
    await fs.writeFile(outputPath, await pdfDoc.save());

    res.download(outputPath, "rotated.pdf", async () => {
      await fs.remove(file.path);
      await fs.remove(outputPath);
    });

  } catch (err) {
    console.error("Rotate PDF Error:", err);
    res.status(500).json({ error: "Failed to rotate PDF." });
  }
};
