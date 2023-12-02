const fs = require('fs');
const readlineSync = require('readline-sync');

function caesarCipher(text, key, action) {
  const isUpperCase = (char) => char === char.toUpperCase();

  return text.split('').map((char) => {
    if (/[a-zA-Z]/.test(char)) {
      const startCode = isUpperCase(char) ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
      const offset = (char.charCodeAt(0) - startCode + key + 26) % 26;
      const encryptedChar = String.fromCharCode(startCode + offset);
      return isUpperCase(char) ? encryptedChar : encryptedChar.toLowerCase();
    }
    return char;
  }).join('');
}

function processFile(inputFileName, outputFileName, key, action) {
  try {
    const data = fs.readFileSync(inputFileName, 'utf-8');
    const result = caesarCipher(data, key, action);
    fs.writeFileSync(outputFileName, result);
    console.log(`${action.charAt(0).toUpperCase() + action.slice(1)}ion successful!`);
  } catch (err) {
    console.error(`Error processing the file: ${err.message}`);
  }
}

function main() {
  const inputFileName = readlineSync.question('Enter the input file name (.txt): ');
  const outputFileName = `${inputFileName.split('.')[0]}_${readlineSync.question('Encrypt or Decrypt? ').toLowerCase()}ed.txt`;
  const key = parseInt(readlineSync.question('Enter the key (-25 to +25): '));

  if (isNaN(key) || key < -25 || key > 25) {
    console.log('Invalid key. Key must be an integer between -25 and +25.');
    return;
  }

  const action = outputFileName.includes('encrypt') ? 'encrypt' : 'decrypt';

  processFile(inputFileName, outputFileName, key, action);
}

// Run the program
main();
