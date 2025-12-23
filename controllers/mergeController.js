const { PDFDocument } = require("pdf-lib");
const fs = require("fs-extra");

module.exports = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No PDFs uploaded" });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdfBytes = await fs.readFile(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
      await fs.remove(file.path); // remove uploaded file after reading
    }

    const mergedBytes = await mergedPdf.save();
    const outputPath = `output/merged_${Date.now()}.pdf`;
    await fs.ensureDir("output");
    await fs.writeFile(outputPath, mergedBytes);

    res.download(outputPath, "merged.pdf", async () => {
      await fs.remove(outputPath);
    });

  } catch (err) {
    console.error("Merge Error:", err);
    res.status(500).json({ error: "Merge failed" });
  }
};
