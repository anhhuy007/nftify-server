const jsend = require("jsend");
const ipfsService = require("../services/ipfs.service");

function randomDates(start, end) {
  // Convert to timestamps
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  // Calculate the time difference
  const timeDistance = endTime - startTime;

  // Generate random time between the range
  const randomTime = startTime + Math.random() * timeDistance;

  // Convert to date object
  const date = new Date(randomTime);

  // Format the date as dd/mm/yyyy
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
function getOriginFromOrigin(stampdataURL) {
  thumbnail = stampdataURL.replace("thumb", "stash").replace("300px-", "");
}

// funtion that return respond based on error or success
function respondPOSTItem(res, status, data, errorMessage) {
  res.send(jsend(status, data, errorMessage));
}

const handleServiceError = (res, error) => {
  // Regular expression to remove two sets of square brackets like [Error][Fail]
  const cleanedMessage = error.message.replace(/^(\[[^\]]+\]){2}\s*/, "");
  console.error("Service Error:", cleanedMessage);
  // console.error('Service Error:', error);

  const errorMap = {
    "not provided": 400, // Bad Request
    Invalid: 400, // Bad Request
    Missing: 400, // Bad Request
    Fail: 400,
    "Validation failed": 422, // Unprocessable Entity

    Exist: 409, // Conflict
    NoneExist: 404, // Not Found
    Unvalid: 401, // Unauthorized
    Unauthorized: 401, // Unauthorized
    Expire: 400,
    Other: 417, // Internal Server Error
  };

  const statusCode =
    Object.entries(errorMap).find(([key]) =>
      error.message.includes(key)
    )?.[1] || 500;

  // const message = error.message.res.status(statusCode).json({
  //     message: error.message,
  //     ...(process.env.NODE_ENV === "development" && {
  //         stack: error.stack,
  //     }),
  // });
  res.status(statusCode).json({
    message: cleanedMessage, // Send cleaned-up message
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
};

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function convertStampToNFTMeta(stampData) {
  // convert stamp data to json
  return JSON.parse(JSON.stringify(stampData));
}

// create access url from ipfs hash (gateway url from cid)
function getIPFSUrl(ipfsHash) {
  return `${process.env.GATEWAY_URL}/ipfs/${ipfsHash}`;
}

function getPinataUrl(pinataUrl) {
  return "https://" + pinataUrl;
}

function handleResponse(success, msg, data){
  if (data && typeof data === 'object' && 'total' in data && 'limit' in data) {
        pagination  = {
            total: data.total,
            limit: data.limit,
            page: data.page,
            totalPages: data.totalPages,
        }
        const dataRes = {
            pagination: pagination,
            items: data.items
        }
        return {
            success: success,
            message: msg,
            data: dataRes
        }
    }
    return {
        success: success,
        message: msg,
        data: data
    }


}

module.exports = {
  randomDates,
  respondPOSTItem,
  handleServiceError,
  shuffleArray,
  convertStampToNFTMeta,
  getIPFSUrl,
  getPinataUrl,
  handleResponse,
};
