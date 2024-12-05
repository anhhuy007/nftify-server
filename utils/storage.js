const ipfsService = require("../services/ipfs.service");

const { PinataSDK } = require("pinata-web3")
const fs = require("fs")
const { Blob } = require("buffer");
const { title } = require("process");
const { get } = require("http");
const { group } = require("console");
require("dotenv").config({ path: "../.env" });

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
})

// Setup IPFS Storage
// StampImg = createGroup("StampImage", true);
// StampMetadata = createGroup("StampMetadata", true);

// // Read file from local storage
// stamp = fs.readFileSync("../datajson/123.jpg");

// ipfsService.uploadStampImage(stamp, "123");

// stamps = JSON.parse(fs.readFileSync("../datajson/Items.json"));

// async function uploadAllMetadata(stamps){
//     try{
//         console.log("Uploading metadata for all stamps: ");
//         for (const stamp of stamps){
//             await ipfsService.uploadStampMetadata(stamp);
//         }
//     }
//     catch (error){
//         console.log(error);
//     }
// }

// uploadAllMetadata(stamps);
