const fs = require("fs-extra");
const { PDFDocument } = require("pdf-lib");
const path = require("path");

module.exports = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No PDF uploaded" });

    let { fromPage, toPage } = req.body;
    fromPage = parseInt(fromPage);
    toPage = parseInt(toPage);

    if (!fromPage || !toPage || fromPage <= 0 || toPage <= 0) {
      return res.status(400).json({ error: "Invalid page numbers" });
    }

    const pdfBytes = await fs.readFile(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    if (fromPage > toPage || toPage > totalPages) {
      return res.status(400).json({
        error: `Page range must be 1-${totalPages} and From ≤ To`,
      });
    }

    const newPdf = await PDFDocument.create();
    const pagesToCopy = Array.from({ length: toPage - fromPage + 1 }, (_, i) => i + fromPage - 1);
    const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
    copiedPages.forEach(page => newPdf.addPage(page));

    const outputPath = `output/split_${Date.now()}.pdf`;
    await fs.ensureDir("output");
    await fs.writeFile(outputPath, await newPdf.save());

    res.download(outputPath, "split.pdf", async () => {
      await fs.remove(file.path);
      await fs.remove(outputPath);
    });

  } catch (err) {
    console.error("Split Error:", err);
    res.status(500).json({ error: "Split failed" });
  }
};
