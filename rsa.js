const fs = require('fs');
const readlineSync = require('readline-sync');

// Helper function to write data to a file
function writeToFile(filename, data) {
  fs.writeFileSync(filename, data);
}

// Helper function to read data from a file
function readFromFile(filename) {
  return fs.readFileSync(filename, 'utf-8');
}

// Helper function to generate RSA key pair
function generateRSAKeyPair(p, q) {
  if (!isPrime(p) || !isPrime(q)) {
    throw new Error('Both p and q must be prime numbers.');
  }

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const e = 65537n;
  const d = modInverse(e, phi);

  const publicKey = { e, n };
  const privateKey = { d, n };

  return { publicKey, privateKey };
}

// Helper function to check if a number is prime
function isPrime(num) {
  if (num <= 1n) return false;
  if (num <= 3n) return true;

  if (num % 2n === 0n || num % 3n === 0n) return false;

  let i = 5n;
  while (i * i <= num) {
    if (num % i === 0n || num % (i + 2n) === 0n) return false;
    i += 6n;
  }

  return true;
}

// Helper function to calculate the modular inverse
function modInverse(a, m) {
  let m0 = m;
  let t, q;
  let x0 = 0n, x1 = 1n;

  if (m === 1n) return 0n;

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

// Helper function to encrypt a message using RSA
function encrypt(message, publicKey) {
  const { e, n } = publicKey;
  const encryptedMessage = message.split('').map(char => {
    const charCode = BigInt(char.charCodeAt(0));
    return charCode ** e % n;
  });
  return encryptedMessage.join(' ');
}

// Helper function to decrypt a message using RSA
function decrypt(encryptedMessage, privateKey) {
  const { d, n } = privateKey;
  const decryptedMessage = encryptedMessage.split(' ').map(char => {
    const charCode = BigInt(char);
    return String.fromCharCode(Number(charCode ** d % n));
  });
  return decryptedMessage.join('');
}

// Get user input for input file
const inputFile = readlineSync.question('Enter the name of the input file: ');

// Prompt user to choose between encryption and decryption
const operation = readlineSync.question('Choose an operation ("encrypt" or "decrypt"): ').toLowerCase();

if (operation === 'encrypt') {
  // Encryption
  const p = BigInt(readlineSync.question('Enter a prime number p: '));
  const q = BigInt(readlineSync.question('Enter a prime number q: '));

  try {
    // Generate RSA key pair
    const { publicKey, privateKey } = generateRSAKeyPair(p, q);

    // Write keys to a file
    writeToFile('keys.txt', `Public Key (e, n): ${publicKey.e}, ${publicKey.n}\nPrivate Key (d, n): ${privateKey.d}, ${privateKey.n}`);

    // Encrypt the file
    const fileContent = readFromFile(inputFile);
    const encryptedMessage = encrypt(fileContent, publicKey);

    // Write the encrypted message to a file
    writeToFile(`${inputFile}_encrypted.txt`, encryptedMessage);

    console.log('Encryption complete.');
    console.log('Public and private keys written to keys.txt');
    console.log(`Encrypted Message written to ${inputFile}_encrypted.txt`);
  } catch (error) {
    console.error(error.message);
  }
} else if (operation === 'decrypt') {
  // Decryption
  const d = BigInt(readlineSync.question('Enter the private exponent d: '));
  const n = BigInt(readlineSync.question('Enter the modulus n: '));

  try {
    // Read the encrypted file
    const encryptedMessage = readFromFile(inputFile);

    // Decrypt the file
    const privateKey = { d, n };
    const decryptedMessage = decrypt(encryptedMessage, privateKey);

    // Write the decrypted message to a file
    writeToFile(`${inputFile}_decrypted.txt`, decryptedMessage);

    console.log('Decryption complete.');
    console.log(`Decrypted Message written to ${inputFile}_decrypted.txt`);
  } catch (error) {
    console.error(error.message);
  }
} else {
  console.log('Invalid operation. Exiting.');
}
