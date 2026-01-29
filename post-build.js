const fs = require('fs-extra');
const path = require('path');

const staticSrcPath = path.join(__dirname, 'build/static');
const staticDestPath = path.join(__dirname, 'build/standalone/build/static');

const publicSrcPath = path.join(__dirname, 'public');
const publicDestPath = path.join(__dirname, 'build/standalone/public');

fs.copy(staticSrcPath, staticDestPath)
  .then(() => console.log('Static files copied successfully.'))
  .catch(err => console.error('Error copying static files:', err));

fs.copy(publicSrcPath, publicDestPath)
  .then(() => console.log('Public files copied successfully.'))
  .catch(err => console.error('Error copying public files:', err));
