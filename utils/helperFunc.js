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
// funtion that return respond based on error or success
function respondPOSTItem(res, status, data, errorMessage) {
  res.send(jsend(status, data, errorMessage));
}

const handleServiceError = (res, error) => {
  console.error('Service Error:', error);

  const errorMap = {
    'not provided': 400,   // Bad Request
    'already exists': 409, // Conflict
    'Invalid': 400,        // Bad Request
    'Missing': 400,        // Bad Request
    'Validation failed': 422, // Unprocessable Entity
  };

  const statusCode = Object.entries(errorMap)
    .find(([key]) => error.message.includes(key))?.[1] || 500;

  res.status(statusCode).json({
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack 
    })
  });
};

function shuffleArray (array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function convertStampToNFTMeta(stampData) {
  // convert stamp data to json
  return JSON.parse(JSON.stringify(stampData));
}

function getIPFSUrl(ipfsHash) {
  return `${process.env.GATEWAY_URL}/ipfs/${ipfsHash}`;
}

function GetIpfsUrlFromPinata(pinataUrl) {
  return "https://" + pinataUrl;
};

module.exports = {
  randomDates,
  respondPOSTItem,
  handleServiceError,
  shuffleArray,
  convertStampToNFTMeta,  
  getIPFSUrl,
  GetIpfsUrlFromPinata
};
