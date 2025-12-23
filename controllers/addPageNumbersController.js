const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

module.exports = async (req, res) => {
  try {
    const {
      pageMode,
      position = "bottom-center",
      margin = 20,
      firstNumber = 1,
      fromPage,
      toPage,
      font = "Helvetica",
    } = req.body;

    const inputPath = req.file.path;
    const outputPath = path.join(
      __dirname,
      "../output",
      `page-numbers-${Date.now()}.pdf`
    );

    const bytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(bytes);

    const pages = pdfDoc.getPages();
    const start = parseInt(fromPage || 1) - 1;
    const end = toPage ? parseInt(toPage) - 1 : pages.length - 1;

    const pdfFont = await pdfDoc.embedFont(StandardFonts[font]);
    let counter = parseInt(firstNumber, 10);

    const marginValue = Number(margin);

    pages.forEach((page, index) => {
      if (index < start || index > end) return;

      const { width, height } = page.getSize();

      let x = width / 2;
      let y = marginValue;

      if (position.includes("top")) y = height - marginValue;
      if (position.includes("left")) x = marginValue;
      if (position.includes("right")) x = width - marginValue;

      page.drawText(String(counter), {
        x,
        y,
        size: 12,
        font: pdfFont,
        color: rgb(0, 0, 0),
      });

      counter++;
    });

    const finalPdf = await pdfDoc.save();
    fs.writeFileSync(outputPath, finalPdf);
    fs.unlinkSync(inputPath);

    res.download(outputPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add page numbers" });
  }
};
