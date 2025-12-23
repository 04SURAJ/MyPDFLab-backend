const fs = require("fs");
const path = require("path");
const {
  PDFDocument,
  rgb,
  degrees,
  StandardFonts,
} = require("pdf-lib");

const OUTPUT_DIR = path.join("output");

async function watermarkController(req, res) {
  try {
    const pdfFile = req.files?.pdf?.[0];
    const imageFile = req.files?.image?.[0];

    if (!pdfFile) {
      return res.status(400).json({ error: "PDF file required" });
    }

    const {
      type,
      text,
      position,
      opacity,
      rotation,
      fromPage,
      toPage,
      layer,
    } = req.body;

    const pdfBytes = fs.readFileSync(pdfFile.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    const start = Math.max(1, parseInt(fromPage || 1)) - 1;
    const end =
      Math.min(totalPages, parseInt(toPage || totalPages)) - 1;

    let embedImage = null;
    let imageDims = null;

    if (type === "image" && imageFile) {
      const imgBytes = fs.readFileSync(imageFile.path);

      embedImage = imageFile.mimetype.includes("png")
        ? await pdfDoc.embedPng(imgBytes)
        : await pdfDoc.embedJpg(imgBytes);

      imageDims = embedImage.scale(0.4);
    }

    let font;
    if (type === "text") {
      font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    for (let i = start; i <= end; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      let x = width / 2;
      let y = height / 2;

      const offset = 40;

      switch (position) {
        case "top-left":
          x = offset;
          y = height - offset;
          break;
        case "top-right":
          x = width - offset;
          y = height - offset;
          break;
        case "bottom-left":
          x = offset;
          y = offset;
          break;
        case "bottom-right":
          x = width - offset;
          y = offset;
          break;
        default:
          break;
      }

      const options = {
        rotate: degrees(Number(rotation) || 0),
        opacity: Number(opacity) || 1,
      };

      if (type === "text") {
        page.drawText(text || "Sampletext", {
          x,
          y,
          size: 40,
          font,
          color: rgb(0.6, 0.6, 0.6),
          ...options,
        });
      }

      if (type === "image" && embedImage) {
        page.drawImage(embedImage, {
          x: x - imageDims.width / 2,
          y: y - imageDims.height / 2,
          width: imageDims.width,
          height: imageDims.height,
          ...options,
        });
      }
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
    }

    const outputPath = path.join(
      OUTPUT_DIR,
      `watermarked-${Date.now()}.pdf`
    );

    const finalPdf = await pdfDoc.save();
    fs.writeFileSync(outputPath, finalPdf);

    // Cleanup uploaded temp files
    fs.unlinkSync(pdfFile.path);
    if (imageFile) fs.unlinkSync(imageFile.path);

    res.download(outputPath, "watermarked.pdf", () => {
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to apply watermark" });
  }
}

module.exports = watermarkController;
