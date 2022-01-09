const axios = require("axios").default;
const config = require('./config');
const Zabbix = require('zabbix-promise')
const URL = config.URL

const zabbix = new Zabbix({
    url: config.URL,
    user: config.User,
    password: config.Password
  })

  const zabbixSender = async (key, value) => {
    try {
      const result = await Zabbix.sender({
        server: '172.20.10.10', // Same as the address inside the .env
        host: 'g',
        key,
        value,
      })
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }

module.exports = {

    createRequest: async (req) => {
        const hostName = req.queryResult.outputContexts[5].parameters.hostname;
        const description = req.queryResult.outputContexts[5].parameters.description;
        try {
            await zabbix.login()
            await zabbixSender("req.create.host", 1);

            const groups = await zabbix.request('hostgroup.get', {})
            const groupId = groups[groups.length - 1].groupid
            const host = await zabbix.request('host.create', {
              host: hostName,
              groups: [{ groupid: groupId }],
              description : description,
              interfaces: [{
                type: 1,
                main: 1,
                useip: 1,
                ip: '127.0.0.1',
                dns: '',
                port: '10050',
              }]
            })
            console.log(host)
            
            await zabbixSender("res.create.host", 1);
            zabbix.logout()
          } catch (error) {
            console.error(error)
          }
    },

    checkRequest: async (body) =>{
        const requestType = body.queryResult.action;
        if(requestType.includes("CreateNewHost"))
        {
            return "create";
        }
        //Need to add else if for the rest of the skills
        
    },
}