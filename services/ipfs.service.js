const { PinataSDK } = require("pinata-web3")
const fs = require("fs")
require("dotenv").config()

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
})

class IpfsService {
  async uploadFile(fileData, filename) {
    try {
        const blob = new Blob([fileData]);
        const file = new File([blob], filename, { type: "text/plain"})
        const upload = await pinata.upload.file(file);

        return upload;
      } catch (error) {
        console.log(error);
        throw new Error("[Error][Fail] Failed to upload file to IPFS: " + error.message);
      }
  }


  // upload stamp medata to Stamp group on pinata
  async uploadStampMetadata(stamp) {
    return;
  }

  async fetchFile(cid) {
    try {
      const file = await pinata.gateways.get(cid);
      console.log(file.data)

      return file.data
    }
    catch (error) {
      console.log(error)
    }
  }
}

module.exports = new IpfsService();