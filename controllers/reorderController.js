const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

exports.reorderPdfPages = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const { order } = req.body;
    if (!order) {
      return res.status(400).json({ error: "Missing page order" });
    }

    const orderedPages = JSON.parse(order);

    const inputPath = req.file.path;
    const data = fs.readFileSync(inputPath);

    const pdfDoc = await PDFDocument.load(data);
    const totalPages = pdfDoc.getPageCount();

    // Validate
    if (orderedPages.some(p => p < 1 || p > totalPages)) {
      return res.status(400).json({ error: "Invalid page numbers" });
    }

    const newPdf = await PDFDocument.create();

    for (let page of orderedPages) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [page - 1]);
      newPdf.addPage(copiedPage);
    }

    const outputBytes = await newPdf.save();
    const outputPath = path.join("output", `reordered_${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, outputBytes);

    fs.unlinkSync(inputPath); // clean uploaded file

    res.download(outputPath, "reordered.pdf", () => {
      fs.unlinkSync(outputPath);
    });

  } catch (error) {
    console.error("Reorder Error:", error);
    return res.status(500).json({ error: "Failed to reorder PDF pages" });
  }
};
