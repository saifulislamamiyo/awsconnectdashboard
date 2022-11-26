const uglifycss = require('uglifycss');
const fs = require('fs').promises;
const path = require('path');

const uglifyCssWrite = async (inpDir, needle) => {
  try {
    const inpFiles = await fs.readdir(inpDir);
    for (const inpFile of inpFiles) {
      if (inpFile.includes(needle)) {
        let inpFileRelPath = path.join(inpDir, inpFile);
        let outFile = inpFile.replace(needle, "");
        let outFileRelPath = path.join(inpDir, outFile)
        console.log(`${new Date().toISOString()} Processing Input file: [${inpFile}] ${inpFileRelPath}`);
        let uglified = `/* ${new Date().toISOString()} *\/\n${uglifycss.processFiles([inpFileRelPath])}`;
        try {
          console.log(`${new Date().toISOString()} Writing Output file:   [${outFile}] ${outFileRelPath}`);
          await fs.writeFile(outFileRelPath, uglified); // need to be in an async function
        } catch (error) {
          console.log(error)
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

let inpDir = 'public/stylesheets/';
uglifyCssWrite(inpDir, '_src')
