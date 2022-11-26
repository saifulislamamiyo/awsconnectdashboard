const uglifyjs = require('uglify-js');
const fs = require('fs');
const path = require('path');

const uglifyJSWrite = (inpDir, needle) => {

  try {
    const inpFiles = fs.readdirSync(inpDir);
    for (const inpFile of inpFiles) {
      if (inpFile.includes(needle)) {
        let inpFileRelPath = path.join(inpDir, inpFile);
        let outFile = inpFile.replace(needle, "");
        let outFileRelPath = path.join(inpDir, outFile)
        console.log(`${new Date().toISOString()} Processing Input file: [${inpFile}] ${inpFileRelPath}`);
        try {
          let inpFileData = fs.readFileSync(inpFileRelPath, "utf8");
          let uglified = uglifyjs.minify(
            {
              "inpFile.js": inpFileData
            },
            {
              "keep_fargs": true,
              "keep_fnames": true,
              "mangle": false,
              "compress": {
                "templates": false,
                "switches": false,
                "spreads": false,
                "strings": false,
                "side_effects": false,
                "typeofs": false,
                "collapse_vars": false,
                "drop_console": true,
                "hoist_props": false,
                "reduce_funcs": false,
                "sequences": false
              }
            }
          );
          if (uglified.warnings === undefined && uglified.error === undefined) {
            console.log(`${new Date().toISOString()} Writing Output file:   [${outFile}] ${outFileRelPath}`);
            let toWrite = `/* ${new Date().toISOString()} *\/\n${uglified.code}`;
            try {
              fs.writeFileSync(outFileRelPath, toWrite);
            } catch (error) {
              console.log(error)
            }
          } else {
            console.log(`${new Date().toISOString()} Error  : ${uglified.error}`);
            console.log(`${new Date().toISOString()} Warning: ${uglified.warnings}`);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

if (1) {
  let inpDir = 'public/javascripts/';
  uglifyJSWrite(inpDir, '_src');
}


