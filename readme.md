# nftify-server

## Description
nftify-server is a backend server for managing NFT-related functionalities. It is built using Node.js and Express, with integration to various blockchain tools.

---

## Installation

### Clone the repository:
```bash
git clone https://github.com/anhhuy007/nftify-server.git
cd nftify-server
```

### Install dependencies:
```bash
npm install
```

### Set up environment variables:
Create a `.env` file in the root directory and add the necessary environment variables.

---

## Scripts

### Start the server:
```bash
npm start
```

### Run in development mode:
```bash
npm run dev
```

### Run tests:
```bash
npm test
```

---

## Initialize Smart Contract

### Step 1: Navigate to the contract directory:
```bash
cd contract
```

### Step 2: Start Hardhat node:
```bash
npx hardhat node
```

### Step 3: Initialize marketplace data:
Open another terminal and run:
```bash
cd contract
npm run init-data
```

## License
This project is licensed under the ISC License.