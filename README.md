# Cryptography Project: 5LC

Five level encryption and decryption:

- [Rail fence cipher](https://en.wikipedia.org/wiki/Rail_fence_cipher)
- [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher)
- [Vigenere cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher)
- [Vernam cipher](https://en.wikipedia.org/wiki/Gilbert_Vernam#The_Vernam_cipher)
- [RSA](<https://en.wikipedia.org/wiki/RSA_(cryptosystem)>)

## How To Run the Program

To run the JavaScript program:

1. Install [Node.js](https://nodejs.org/en/download) in your PC.
2. Download `5lc.js` and create a local folder.
3. Open terminal or command prompt in the folder.
4. Install the needed dependency i.e., [readline-sync](https://www.npmjs.com/package/readline-sync).

```properties
npm install readline-sync
```

5. Run the program.

```properties
node 5lc.js
```

6. Input the needed keys: Rail fence cipher (positive integer), Caesar cipher (positive integer), Vigenere (character), Vernam (character), RSA (two prime numbers).
7. The output file for encryption is `filename_encrypted.txt` and for decryption is `filename_decrypted.txt`.

### Notes

For the input file:

- Spaces in the text file are treated as characters.
- No non-alphabetic characters (no symbols and numbers).

For the encryption and decryption key:

- No spaces for character keys.
