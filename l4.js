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

function processFile(inputFilename, outputFilename, caesarKey, vigenereKey, vernamKey, railKey, encrypt) {
    try {
        let data = fs.readFileSync(inputFilename, 'utf8');

        if (encrypt) {
            data = railFenceEncrypt(data, railKey);
            data = caesarCipher(data, caesarKey);
            data = vigenereCipher(data, vigenereKey);
            data = vernamCipher(data, vernamKey);
        } else {
            data = vernamCipher(data, vernamKey, false);
            data = vigenereCipher(data, vigenereKey, false);
            data = caesarCipher(data, caesarKey, false);
            data = railFenceEncrypt(data, railKey);
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

                                const outputFilename = isEncrypt
                                    ? `${inputFilename.split('.')[0]}_encrypted.txt`
                                    : `${inputFilename.split('.')[0]}_decrypted.txt`;

                                processFile(inputFilename, outputFilename, caesarKey, vigenereKey, vernamKey, railKey, isEncrypt);
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