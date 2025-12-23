const fs = require("fs");
const pdfParse = require("pdf-parse");

const extractText = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath);

    const data = await pdfParse(buffer);

    // Split by form-feed just for readability (optional)
    const allPagesText = data.text.split("\f");

    // Return entire PDF as one object
    return res.json({
      success: true,
      pages: [
        {
          page: 1,
          text: data.text.trim(),
        },
      ],
    });
  } catch (err) {
    console.error("EXTRACTION ERROR:", err);
    return res.status(500).json({ message: "Text extraction failed", error: err.message });
  }
};

module.exports = { extractText };
