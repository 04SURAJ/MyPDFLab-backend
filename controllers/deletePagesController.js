const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

exports.deletePages = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file missing" });
    }

    const keepPages = JSON.parse(req.body.keepPages || "[]");

    if (!Array.isArray(keepPages) || keepPages.length === 0) {
      return res.status(400).json({ message: "No pages to keep" });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(
      __dirname,
      "../output",
      `deleted-${Date.now()}.pdf`
    );

    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const newPdf = await PDFDocument.create();

    for (const pageNum of keepPages) {
      const pageIndex = pageNum - 1;
      if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue;

      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
      newPdf.addPage(copiedPage);
    }

    const pdfBytes = await newPdf.save();
    fs.writeFileSync(outputPath, pdfBytes);

    // cleanup uploaded file
    fs.unlinkSync(inputPath);

    res.download(outputPath, () => {
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error("Delete pages error:", err);
    res.status(500).json({ message: "Failed to delete pages" });
  }
};
