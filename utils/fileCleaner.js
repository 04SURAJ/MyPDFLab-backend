const fs = require('fs-extra');

module.exports = async function(files){
  try {
    for(const f of files){
      await fs.remove(f.path);
    }
  } catch (err) {
    console.error("File cleanup error:", err);
  }
};
