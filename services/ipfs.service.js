const { PinataSDK } = require("pinata-web3")
const fs = require("fs")
require("dotenv").config()

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
})

class IpfsService {
  async uploadFile() {
    try {
        const blob = new Blob([fs.readFileSync("./hello-world.txt")]);
        const file = new File([blob], "hello-world.txt", { type: "text/plain"})
        const upload = await pinata.upload.file(file);
        console.log(upload)
      } catch (error) {
        console.log(error)
      }
  }
}

module.exports = new IpfsService();