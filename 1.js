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

function processFile(inputFilename, outputFilename, key, encrypt) {
    try {
        const data = fs.readFileSync(inputFilename, 'utf8');
        const processedData = caesarCipher(data, key, encrypt);
        fs.writeFileSync(outputFilename, processedData);
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
                rl.question('Enter the Caesar Cipher key (1 to 25): ', (key) => {
                    key = parseInt(key);

                    if (isNaN(key) || key < 1 || key > 25) {
                        console.error('Invalid key. Please enter a number between 1 and 25.');
                        rl.close();
                        return;
                    }

                    const outputFilename = isEncrypt
                        ? `${inputFilename.split('.')[0]}_encrypted.txt`
                        : `${inputFilename.split('.')[0]}_decrypted.txt`;

                    processFile(inputFilename, outputFilename, key, isEncrypt);
                    rl.close();
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
