# ProofMint - Setup Summary

## Software Installed

### 1. Node.js
- JavaScript runtime that executes our backend code outside the browser.
- Comes with npm, which is used to install packages.

### 2. Git
- Version control system used to track changes and collaborate through GitHub.

### 3. VS Code
- Our code editor for writing and managing the project.

### 4. MetaMask
- Ethereum wallet used to sign blockchain transactions and interact with smart contracts.

---

## Accounts Created

### 1. GitHub
- Hosts our project repository and enables collaboration.

### 2. MongoDB Atlas
- Cloud database where we store project metadata (image hash, owner, AI result, timestamps, etc.).

### 3. Alchemy
- Provides a reliable connection (RPC) to the Ethereum blockchain without running our own node.

### 4. Cloudinary
- Stores uploaded images securely in the cloud instead of on the blockchain.

### 5. Hugging Face
- AI service used to analyse uploaded images (e.g., AI-generated vs human-created).

---

## VS Code Extensions

### ESLint
- Finds JavaScript mistakes and improves code quality.

### Prettier
- Automatically formats code into a consistent style.

### Error Lens
- Shows errors directly inside the editor.

### Thunder Client
- Tests backend APIs without needing Postman.

### GitLens
- Provides enhanced Git history and code tracking.

### DotENV
- Adds syntax highlighting for `.env` files.

### Material Icon Theme
- Makes project folders and files easier to identify.

### npm Intellisense
- Autocompletes installed npm package names.

### Path Intellisense
- Autocompletes file and folder paths during imports.

### JavaScript ES6 Snippets
- Provides shortcuts for writing common JavaScript code.

---

## Backend Packages

### Express
- Creates the backend server and handles incoming HTTP requests.

### Mongoose
- Connects JavaScript to MongoDB using models and schemas.

### dotenv
- Loads sensitive configuration (API keys, database URLs, secrets) from a `.env` file.

### Multer
- Processes file uploads sent from the frontend.

### CORS
- Allows the React frontend and Express backend to communicate across different origins.

### Axios
- Sends HTTP requests from our backend to external APIs such as Hugging Face.

### ethers.js
- Connects our backend to Ethereum and interacts with smart contracts.

### crypto (Built into Node.js)
- Generates SHA-256 hashes for uploaded images to create unique digital fingerprints.

---

## Project Architecture

User
↓
React Frontend
↓
Express Server
↓
Multer (Extract Uploaded Image)
↓
crypto (Generate SHA-256 Hash)
↓
Axios → Hugging Face (AI Detection)
↓
Cloudinary (Store Image)
↓
Mongoose → MongoDB Atlas (Store Metadata)
↓
ethers.js → Alchemy → Ethereum (Store Hash on Blockchain)

---

## Current Status

✅ Development environment ready

✅ Backend packages installed

✅ Cloud services configured

✅ Ready to start building the backend server