const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

function processFile(inputFilename, outputFilename, caesarKey, vigenereKey, encrypt) {
    try {
        let data = fs.readFileSync(inputFilename, 'utf8');

        if (encrypt) {
            data = caesarCipher(data, caesarKey);
            data = vigenereCipher(data, vigenereKey);
        } else {
            data = vigenereCipher(data, vigenereKey, false);
            data = caesarCipher(data, caesarKey, false);
        }

        fs.writeFileSync(outputFilename, data);
        console.log(`${encrypt ? 'Encrypted' : 'Decrypted'} successfully. Check ${outputFilename}`);
    } catch (err) {
        console.error(`Error reading or writing file: ${err.message}`);
    }
}

function main() {
    rl.question('Enter the filename (with .txt extension): ', (inputFilename) => {
        rl.question('Do you want to encrypt or decrypt? ', (operation) => {
            const isEncrypt = operation.toLowerCase() === 'encrypt';

            if (isEncrypt || operation.toLowerCase() === 'decrypt') {
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

                        const outputFilename = isEncrypt
                            ? `${inputFilename.split('.')[0]}_encrypted.txt`
                            : `${inputFilename.split('.')[0]}_decrypted.txt`;

                        processFile(inputFilename, outputFilename, caesarKey, vigenereKey, isEncrypt);
                        rl.close();
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
