const fs = require('fs');

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

function processFile(filename, operation, key) {
    try {
        const data = fs.readFileSync(filename, 'utf8');

        let result;
        if (operation === 'encrypt') {
            result = railFenceEncrypt(data, key);
            fs.writeFileSync(`${filename}_encrypted.txt`, result);
            console.log(`Encryption completed. Result saved in ${filename}_encrypted.txt`);
        } else if (operation === 'decrypt') {
            result = railFenceDecrypt(data, key);
            fs.writeFileSync(`${filename}_decrypted.txt`, result);
            console.log(`Decryption completed. Result saved in ${filename}_decrypted.txt`);
        } else {
            console.log('Invalid operation. Please choose either "encrypt" or "decrypt".');
        }
    } catch (error) {
        console.error('Error processing file:', error.message);
    }
}

const readline = require('readline-sync');

const filename = readline.question('Enter the filename (with .txt extension): ');
const operation = readline.question('Do you want to encrypt or decrypt? ').toLowerCase();

if (operation === 'encrypt' || operation === 'decrypt') {
    const key = parseInt(readline.question('Enter the Rail Fencer cipher key: '));

    if (isNaN(key) || key <= 0) {
        console.log('Invalid key. Please enter a positive integer.');
    } else {
        processFile(filename, operation, key);
    }
} else {
    console.log('Invalid operation. Please choose either "encrypt" or "decrypt".');
}
