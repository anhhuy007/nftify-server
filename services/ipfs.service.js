const { PinataSDK } = require("pinata-web3")
const fs = require("fs")
const { Blob } = require("buffer");
const { title } = require("process");
require("dotenv").config({ path: "../.env" });

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
        throw new Error("Failed to upload file to IPFS: " + error.message);
      }
  }


  // upload stamp medata to Stamp group on pinata
  async uploadStampMetadata(stamp) {
    try {
      const metadata = {
        _id: stamp._id,
        creatorId: stamp.creatorId,
        title: stamp.title,
        issuedBy: stamp.issuedBy,
        function: stamp.function,
        date: stamp.date,
        denom: stamp.denom,
        color: stamp.color,
        imgUrl: stamp.imgUrl,
        createdAt: stamp.createdAt,
      };

      const upload = await pinata.pinJSONToIPFS(metadata);

      return upload;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to upload stamp metadata to IPFS: " + error.message);
    }
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
  

  CID = "bafkreietnimfzkvcm25zzpuyd2pals3yzvzswczsqdvzirasxnxy7dyhv4"

  async fetchFile(CID){
    try {
      const file = await pinata.gateways.get(CID);
      console.log(file)
    } catch (error) {
      console.log(error)
    }
  }
}

pinata.testAuthentication().then((result) => {
  console.log(result)
}
).catch((error) => {
  console.log(error)
}
)


module.exports = new IpfsService();