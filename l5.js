const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function railFenceEncrypt(text, key) {
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

function railFenceDecrypt(text, key) {
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

function caesarCipher(text, key, encrypt = true) {
    return text.replace(/[a-zA-Z]/g, (char) => {
        const base = char < 'a' ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
        const offset = (char.charCodeAt(0) - base + (encrypt ? key : 26 - key)) % 26;
        return String.fromCharCode(base + offset);
    });
}

function vigenereCipher(text, key, encrypt = true) {
    let result = '';
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (/[a-zA-Z]/.test(char)) {
            const base = char < 'a' ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            const keyChar = key[keyIndex % key.length];
            const keyOffset = keyChar.charCodeAt(0) - (keyChar < 'a' ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0));
            const offset = (char.charCodeAt(0) - base + (encrypt ? keyOffset : 26 - keyOffset)) % 26;
            result += String.fromCharCode(base + offset);
            keyIndex++;
        } else {
            result += char;
        }
    }

    return result;
}

function vernamCipher(text, key, encrypt = true) {
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
function encryptRSA(message, publicKey) {
    const { e, n } = publicKey;
    const encryptedMessage = message.split('').map(char => {
        const charCode = BigInt(char.charCodeAt(0));
        return modPow(charCode, e, n);
    });
    return Buffer.from(encryptedMessage.join(' '), 'hex').toString('base64');
}

// Helper function to decrypt a message using RSA
function decryptRSA(encryptedMessage, privateKey) {
    const { d, n } = privateKey;
    const encryptedBytes = Buffer.from(encryptedMessage, 'base64').toString('hex');
    const decryptedMessage = encryptedBytes.match(/.{1,16}/g).map(hexBlock => {
        const charCode = modPow(BigInt('0x' + hexBlock), d, n);
        return String.fromCharCode(Number(charCode));
    });
    return decryptedMessage.join('');
}

// Helper function for modular exponentiation
function modPow(base, exponent, modulus) {
    let result = 1n;
    base = base % modulus;

    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }

    return result;
}

function processFile(filename, operation, railKey, caesarKey, vigenereKey, vernamKey, rsaPrivateKey, rsaPublicKey, encrypt) {
    try {
        let data = fs.readFileSync(filename, 'utf8');

        if (encrypt) {
            // Encryption order: Rail Fence, Caesar, Vigenere, Vernam, RSA
            data = railFenceEncrypt(data, railKey);
            data = caesarCipher(data, caesarKey);
            data = vigenereCipher(data, vigenereKey);
            data = vernamCipher(data, vernamKey);

            // Encrypt the data using RSA
            const encryptedData = encryptRSA(data, rsaPublicKey);

            // Write the encrypted data to a file
            const outputFilename = `${filename.split('.')[0]}_encrypted.txt`;
            fs.writeFileSync(outputFilename, encryptedData);
        } else {
            // RSA decryption is the first step in the decryption order
            const privateKey = { d: rsaPrivateKey.d, n: rsaPrivateKey.n };
            
            // Read the encrypted file
            const encryptedData = fs.readFileSync(filename, 'utf8');

            // Decrypt the data using RSA
            const decryptedData = decryptRSA(encryptedData, privateKey);

            // Decryption order: Vernam, Vigenere, Caesar, Rail Fence
            decryptedData = vernamCipher(decryptedData, vernamKey, false);
            decryptedData = vigenereCipher(decryptedData, vigenereKey, false);
            decryptedData = caesarCipher(decryptedData, caesarKey, false);
            decryptedData = railFenceDecrypt(decryptedData, railKey);

            // Write the decrypted data to a file
            const outputFilename = `${filename.split('.')[0]}_decrypted.txt`;
            fs.writeFileSync(outputFilename, decryptedData);
        }

        console.log(`${encrypt ? 'Encrypted' : 'Decrypted'} successfully. Check ${outputFilename}`);
    } catch (err) {
        console.error(`Error reading or writing file: ${err.message}`);
    }
}


function main() {
    rl.question('Enter the filename (with .txt extension): ', (filename) => {
        rl.question('Do you want to encrypt or decrypt? ', (operation) => {
            const isEncrypt = operation.toLowerCase() === 'encrypt';

            if (isEncrypt || operation.toLowerCase() === 'decrypt') {
                rl.question('Enter the Rail Fence Cipher key: ', (railKey) => {
                    rl.question('Enter the Caesar Cipher key (1 to 25): ', (caesarKey) => {
                        caesarKey = parseInt(caesarKey);

                        if (isNaN(caesarKey) || caesarKey < 1 || caesarKey > 25) {
                            console.error('Invalid Caesar Cipher key. Please enter a number between 1 and 25.');
                            rl.close();
                            return;
                        }

                        rl.question('Enter the Vigenere Cipher key: ', (vigenereKey) => {
                            if (!/^[a-zA-Z]+$/.test(vigenereKey)) {
                                console.error('Invalid Vigenere Cipher key. Please enter only alphabetical characters.');
                                rl.close();
                                return;
                            }

                            rl.question('Enter the Vernam Cipher key: ', (vernamKey) => {
                                if (!/^[a-zA-Z]+$/.test(vernamKey)) {
                                    console.error('Invalid Vernam Cipher key. Please enter only alphabetical characters.');
                                    rl.close();
                                    return;
                                }

                                processFile(filename, operation, railKey, caesarKey, vigenereKey, vernamKey, isEncrypt);
                                rl.close();
                            });
                        });
                    });
                });
            } else {
                console.error('Invalid operation. Please enter "encrypt" or "decrypt".');
                rl.close();
            }
        });
    });
}

// Run the main function
main();
