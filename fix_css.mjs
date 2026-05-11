import fs from 'fs';

const data = fs.readFileSync('src/app/globals.css');
// Remove null bytes
const cleanData = data.filter(byte => byte !== 0);
fs.writeFileSync('src/app/globals.css', cleanData);
console.log('Cleaned!');
