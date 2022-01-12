const dotenv =  require('dotenv');
dotenv.config();

const config = {
    PORT: process.env.PORT,
    URL: process.env.URL,
    ADDRESS: process.env.ADDRESS,
    SLACK: process.env.SLACK,
    User : "Admin",
    Password : process.env.Password,
}


module.exports = config;
