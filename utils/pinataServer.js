const { PinataSDK } = require("pinata")
const fs = require("fs")
const { Blob } = require("buffer")
require("dotenv").config({ path: "../.env" });


const pinata = new PinataSDK({
  //pinataJWTKey: process.env.PINATA_JWT_KEY,
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
})

pinata.testAuthentication().then((result) => {
  console.log(result)
}
).catch((error) => {
  console.log(error)
}
)


async function upload(){
  try {
    const blob = new Blob([fs.readFileSync("./hello-world.txt")]);
    const file = new File([blob], "hello-world.txt", { type: "text/plain"})
    const upload = await pinata.upload.file(file);
    console.log(upload)
  } catch (error) {
    console.log(error)
  }
}

//upload()

CID = "bafkreietnimfzkvcm25zzpuyd2pals3yzvzswczsqdvzirasxnxy7dyhv4"

async function fetchFile(CID){
  try {
    const file = await pinata.gateways.get(CID);
    console.log(file)
  } catch (error) {
    console.log(error)
  }
}

fetchFile(CID)

