const dotenv =  require('dotenv');
dotenv.config();

const config = {
    PORT: process.env.port,
    URL: process.env.URL,
    User : process.env.User,
    Password : process.env.Password,
}


module.exports = config;