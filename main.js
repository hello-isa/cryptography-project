// Importing necessary modules for file handling and user input
const fs = require('fs');
const readlineSync = require('readline-sync');

// Write data to a file
function writeToFile(filename, data) {
  fs.writeFileSync(filename, data);
}

// Read data from a file
function readFromFile(filename) {
  return fs.readFileSync(filename, 'utf-8');
}

// Generate an RSA key pair given two prime numbers
function generateRSAKeyPair(p, q) {
  if (!isPrime(p) || !isPrime(q)) {
    throw new Error('Both p and q must be prime numbers.');
  }

  // Calculate n, phi, public exponent (e), and private exponent (d)
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const e = 65537n; // Commonly used public exponent
  const d = modInverse(e, phi);

  // Create public and private key objects
  const publicKey = { e, n };
  const privateKey = { d, n };

  return { publicKey, privateKey };
}

// Check if a number is prime
function isPrime(num) {
  if (num <= 1n) return false;
  if (num <= 3n) return true;

  if (num % 2n === 0n || num % 3n === 0n) return false;

  // Use a faster prime-checking algorithm for larger numbers
  let i = 5n;
  while (i * i <= num) {
    if (num % i === 0n || num % (i + 2n) === 0n) return false;
    i += 6n;
  }

  return true;
}

// Calculate the modular inverse
function modInverse(a, m) {
  let m0 = m;
  let t, q;
  let x0 = 0n, x1 = 1n;

  if (m === 1n) return 0n;

  // Extended Euclidean Algorithm to find modular inverse
  while (a > 1n) {
    q = a / m;
    t = m;
    m = a % m;
    a = t;
    t = x0;
    x0 = x1 - q * x0;
    x1 = t;
  }

  if (x1 < 0n) x1 += m0;

  return x1;
}

// Encrypt a message using RSA
function encryptRSA(message, publicKey) {
  const { e, n } = publicKey;
  const encryptedMessage = message.split('').map(char => {
    const charCode = BigInt(char.charCodeAt(0));
    return charCode ** e % n;
  });
  return encryptedMessage.join(' ');
}

// Decrypt a message using RSA
function decryptRSA(encryptedMessage, privateKey) {
  const { d, n } = privateKey;
  const decryptedMessage = encryptedMessage.split(' ').map(char => {
    const charCode = BigInt(char);
    return String.fromCharCode(Number(charCode ** d % n));
  });
  return decryptedMessage.join('');
}

// Encrypt a message using Rail fence cipher
function railFenceEncrypt(text, key) {
  // Create a fence pattern, then fill it with characters in a zigzag manner
    let fence = [];
    for (let i = 0; i < key; i++) {
        fence.push([]);
    }

    let rail = 0;
    let direction = 1;

    for (let char of text) {
        fence[rail].push(char);
        rail += direction;

        if (rail === key - 1 || rail === 0) {
            direction = -direction;
        }
    }

    let encryptedText = '';
    for (let row of fence) {
        encryptedText += row.join('');
    }

    return encryptedText;
}

// Decrypt a message using Rail fence cipher
function railFenceDecrypt(text, key) {
  // Reconstruct the fence pattern and read characters in the correct order
    let fence = [];
    for (let i = 0; i < key; i++) {
        fence.push([]);
    }

    let rail = 0;
    let direction = 1;

    for (let char of text) {
        fence[rail].push('x'); // placeholder for characters
        rail += direction;

        if (rail === key - 1 || rail === 0) {
            direction = -direction;
        }
    }

    let index = 0;
    for (let i = 0; i < key; i++) {
        for (let j = 0; j < fence[i].length; j++) {
            fence[i][j] = text[index];
            index++;
        }
    }

    rail = 0;
    direction = 1;
    let decryptedText = '';

    for (let i = 0; i < text.length; i++) {
        decryptedText += fence[rail].shift();
        rail += direction;

        if (rail === key - 1 || rail === 0) {
            direction = -direction;
        }
    }

    return decryptedText;
}

// Encrypt and decrypt a message using Caesar cipher
function caesarCipher(text, key, encrypt = true) {
  // Shift each letter in the text by the specified integer key 
    return text.replace(/[a-zA-Z]/g, (char) => {
        const base = char < 'a' ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
        const offset = (char.charCodeAt(0) - base + (encrypt ? key : 26 - key)) % 26;
        return String.fromCharCode(base + offset);
    });
}

// Encrypt and decrypt a message using Vigenere cipher
function vigenereCipher(text, key, encrypt = true) {
  // Shift each letter in the text by the specified character key
    let result = '';
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (/[a-zA-Z]/.test(char)) {
          // If the character is an alphabetic letter
            const base = char < 'a' ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            const keyChar = key[keyIndex % key.length];
            const keyOffset = keyChar.charCodeAt(0) - (keyChar < 'a' ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0));
            
          // Calculate the offset for encryption or decryption based on the key
            const offset = (char.charCodeAt(0) - base + (encrypt ? keyOffset : 26 - keyOffset)) % 26;
          
          // Apply the offset and construct the result string
            result += String.fromCharCode(base + offset);
            keyIndex++;
        } else {
          // If the character is not an alphabetic letter, keep it unchanged
            result += char;
        }
    }

    return result;
}

// Encrypt and decrypt a message using Vernam cipher
function vernamCipher(text, key, encrypt = true) {
  // XOR each character in the text with the corresponding key character
    return text
        .split('')
        .map((char, index) => {
            const charCode = char.charCodeAt(0);
            const keyChar = key[index % key.length].charCodeAt(0);
            const result = encrypt ? charCode ^ keyChar : charCode ^ keyChar;
            return String.fromCharCode(result);
        })
        .join('');
}

// Function to process a file using RSA and other ciphers based on user input
function processFileWithRSA(filename, operation, railKey, caesarKey, vigenereKey, vernamKey, rsaKeys) {
  try {
    let data = fs.readFileSync(filename, 'utf8');

    if (operation === 'encrypt') {
      // Apply a series of encryption algorithms
      data = railFenceEncrypt(data, railKey);
      data = caesarCipher(data, caesarKey);
      data = vigenereCipher(data, vigenereKey);
      data = vernamCipher(data, vernamKey);
      data = encryptRSA(data, rsaKeys.publicKey);

      // Write RSA keys to a file
      writeToFile('rsa_keys.txt', `Public Key (e, n): ${rsaKeys.publicKey.e}, ${rsaKeys.publicKey.n}\nPrivate Key (d, n): ${rsaKeys.privateKey.d}, ${rsaKeys.privateKey.n}`);
      console.log('Generated keys are written to rsa_keys.txt');
    } else if (operation === 'decrypt') {
      // Apply a series of decryption algorithms
      data = decryptRSA(data, rsaKeys.privateKey);
      data = vernamCipher(data, vernamKey, false);
      data = vigenereCipher(data, vigenereKey, false);
      data = caesarCipher(data, caesarKey, false);
      data = railFenceDecrypt(data, railKey);
    } else {
      console.error('Invalid operation. Please enter "encrypt" or "decrypt".');
      return;
    }

    // Write the processed data to a new file
    const outputFilename = `${filename.split('.')[0]}_${operation === 'encrypt' ? 'encrypted' : 'decrypted'}.txt`;
    fs.writeFileSync(outputFilename, data);
    console.log(`${operation === 'encrypt' ? 'Encrypted' : 'Decrypted'} successfully. Check ${outputFilename}`);
  } catch (err) {
    console.error(`Error reading or writing file: ${err.message}`);
  }
}

// Main function to orchestrate the entire process
function main() {
  // Display project information
  console.log('\tIAS Cryptography Project');
  console.log('\tFive Level Encryption and Decryption:');
  console.log('\tRail fence cipher, Caesar cipher, Vigenere cipher, Vernam cipher and RSA');
  console.log('\tFor instructions: check README.md\n');
  
  // Get user input for input file
  const filename = readlineSync.question('Enter the input file (include file extension): ');

  // Prompt user to choose between encryption and decryption
  const operation = readlineSync.question('Choose an operation ("encrypt" or "decrypt"): ').toLowerCase();

  if (operation === 'encrypt') {
    // Encryption
    const railKey = readlineSync.question('Enter the Rail Fence Cipher key: ');
    const caesarKey = parseInt(readlineSync.question('Enter the Caesar Cipher key (1 to 25): '));
    const vigenereKey = readlineSync.question('Enter the Vigenere Cipher key: ');
    const vernamKey = readlineSync.question('Enter the Vernam Cipher key: ');

    // RSA key input
    const p = BigInt(readlineSync.question('Enter a prime number p for RSA: '));
    const q = BigInt(readlineSync.question('Enter a prime number q for RSA: '));

    try {
      // Generate RSA keys and process the file
      const rsaKeys = generateRSAKeyPair(p, q);
      processFileWithRSA(filename, operation, railKey, caesarKey, vigenereKey, vernamKey, rsaKeys);
    } catch (error) {
      console.error(error.message);
    }
  } else if (operation === 'decrypt') {
    // Decryption
    const rsaD = BigInt(readlineSync.question('Enter the private exponent d for RSA: '));
    const rsaN = BigInt(readlineSync.question('Enter the modulus n for RSA: '));

    const railKey = readlineSync.question('Enter the Rail Fence Cipher key: ');
    const caesarKey = parseInt(readlineSync.question('Enter the Caesar Cipher key (1 to 25): '));
    const vigenereKey = readlineSync.question('Enter the Vigenere Cipher key: ');
    const vernamKey = readlineSync.question('Enter the Vernam Cipher key: ');

    const rsaKeys = { privateKey: { d: rsaD, n: rsaN } };

    // Process the file using RSA and other ciphers
    processFileWithRSA(filename, operation, railKey, caesarKey, vigenereKey, vernamKey, rsaKeys);
  } else {
    console.log('Invalid operation. Exiting.');
  }
}

// Run the main function to start the program
main();
