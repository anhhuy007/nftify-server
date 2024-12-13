const { PinataSDK } = require("pinata-web3")
const fs = require("fs")
const { Blob } = require("buffer");
const { title } = require("process");
require("dotenv").config({ path: "../.env" });


const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
})

let StampImgGroup = pinata.groups.list().name("StampImage");
let StampMetadataGroup = pinata.groups.list().name("StampMetadata");
let AvatarImgGroup = pinata.groups.list().name("AvatarImage");
let BgImgGroup = pinata.groups.list().name("BgImage");


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

  async uploadStampImage(stampImgObj) {
    try {
      const upload = await pinata.upload.file(stampImgObj)
        .group(StampImgGroup[0].id)
      return upload;
    }
    catch (error) {
      console.log(error);
      throw new Error("Failed to upload stamp image to IPFS: " + error.message);
    }
}

  async uploadAvatarImage(avatarImgObj) {
    try {
        // Validate input
        if (!avatarImgObj) {
            throw new Error('Avatar image object is required');
        }

        // Ensure AvatarImgGroup is initialized
        if (!AvatarImgGroup || !AvatarImgGroup[0]) {
            const group = await pinata.groups.create({ name: 'AvatarImage' });
            AvatarImgGroup = [group];
        }

        // Upload file to IPFS through Pinata
        const options = {
            pinataMetadata: {
                name: `Avatar-${Date.now()}`,
                groupId: AvatarImgGroup[0].id
            }
        };

        const upload = await pinata.upload.file(avatarImgObj, options).group(AvatarImgGroup[0].id);

        console.log('Uploaded avatar image to IPFS:', upload.IpfsHash);
        return {
            ipfsHash: upload.IpfsHash,
            pinSize: upload.PinSize,
            timestamp: upload.Timestamp
        };

    } catch (error) {
        console.error('IPFS Upload Error:', error);
        throw new Error(`Failed to upload avatar image to IPFS: ${error.message}`);
    }
  }

  async  uploadBgImage(bgImgObj) {
    try {

      if (!BgImgGroup || !BgImgGroup[0]) {
        const group = await pinata.groups.create({ name: 'BgImage' });
        BgImgGroup = [group];
      }
      
      const upload = await pinata.upload.file(bgImgObj)
        .group(BgImgGroup[0].id)
      return upload;
    }
    catch (error) {
      console.log(error);
      throw new Error("Failed to upload background image to IPFS: " + error.message);
    }
  }
    

  // upload stamp metadata to Stamp group on pinata
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

      const upload = await pinata.upload.json(metadata, { 
        pinataMetadata: { 
          name: `${stamp._id}.json`, 
        }}).group(StampMetadataGroup[0].id);
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