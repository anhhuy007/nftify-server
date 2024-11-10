const jsend = require('jsend');


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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}
// funtion that return respond based on error or success
function respondPOSTItem(res, status, data, errorMessage) {
    res.send(jsend(status, data, errorMessage));
} 


// console.log(randomDates('01/01/1900', '01/01/2000'))
// console.log(randomDates('01/01/1900', '01/01/2000'))

module.exports = {
    randomDates,
    respondPOSTItem
}