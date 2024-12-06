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

  async uploadStampImage(stampImg, stampTitle) {
    try {
      const StampImgGroup = await pinata.groups.list().name("StampImage");
      const blob = new Blob([stampImg]);
      const file = new File([blob], {stampTitle}, { type: "image/jpeg" });
      
    
      const upload = await pinata.upload.file(file)
        .group(StampImgGroup[0].id)
      return upload;
    }
    catch (error) {
      console.log(error);
      throw new Error("Failed to upload stamp image to IPFS: " + error.message);
    }
}
    

  // upload stamp metadata to Stamp group on pinata
  async uploadStampMetadata(stamp) {
    try {
      const StampMetadata = await pinata.groups.list().name("StampMetadata")
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

      const upload = await pinata.upload.json(metadata, { 
        pinataMetadata: { 
          name: `${stamp._id}.json`, 
        }}).group(StampMetadata[0].id);
      console.log("Uploaded metadata with id: ", stamp._id);
      // log the id and cid into log file
      fs.appendFileSync("../logs/metadata.log", `${stamp._id}: ${upload.IpfsHash}\n`);
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

  async createGroup(groupName, is_public=false) {
    try {
      const group = await pinata.groups.create({
          name: groupName,
          is_public: is_public,
          });
      console.log("group created: ", group);
      return group;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to create group: " + error.message);
    }
  }

  async testAuthentication() {
    try {
      const auth = await pinata.auth.test();
      console.log(auth);
      return auth;
    }
    catch (error) {
      console.log(error);
    }
  }

  

}
module.exports = new IpfsService();