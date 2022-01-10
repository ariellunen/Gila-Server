const axios = require("axios").default;
const config = require("./config");
const Zabbix = require("zabbix-promise");
const URL = config.URL;

const zabbix = new Zabbix({
  url: config.URL,
  user: config.User,
  password: config.Password,
});

const zabbixSender = async (key, value, host) => {
  try {
    const result = await Zabbix.sender({
      server: "172.20.10.10", // Same as the address inside the .env
      key,
      value,
      host,
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createRequest: async (req) => {
    const hostName = req.queryResult.outputContexts[5].parameters.hostname;
    const description =
      req.queryResult.outputContexts[5].parameters.description;
    try {
      await zabbix.login();
      // const zabbixSender = async (Key, Value) => {
      //   try {
      //     const result = await Zabbix.sender({
      //       server: "172.20.10.10", // Same as the address inside the .env
      //       host: hostName,
      //       key: Key,
      //       value: Value,
      //     });
      //     console.log(result);
      //   } catch (error) {
      //     console.error(error);
      //   }
      // };
      await zabbixSender("req.create.host", 1, "zserver"); //change to G

      const groups = await zabbix.request("hostgroup.get", {});
      const groupId = groups[groups.length - 1].groupid;

      const templateID = await zabbix.request("template.get", {
        output: "extend",
        filter: {
          host: ["Template Monitoring Requests and Responses"],
        },
      });
      //console.log(templateID[0].templateid);
      const temp = templateID[0].templateid;

      const host = await zabbix.request("host.create", {
        host: hostName,
        groups: [{ groupid: groupId }],
        description: description,
        interfaces: [
          {
            type: 1,
            main: 1,
            useip: 1,
            ip: "127.0.0.1",
            dns: "",
            port: "10050",
          },
        ],
        templates: [
          {
            templateid: temp,
          },
        ],
      });

      console.log(host);

      await zabbixSender("res.create.host", 1, "zserver"); //change to G
      zabbix.logout();
    } catch (error) {
      console.error(error);
    }
  },

  checkRequest: async (body) => {
    const requestType = body.queryResult.action;
    console.log(requestType);
    if (requestType.includes("CreateNewHost")) {
      return "create";
    } else if (requestType.includes("ZabbixProblemReport")) {
      return "problem";
    } else {
      return "failed";
    }
  },

  problemsRequest: async (req) => {
    try {
      await zabbix.login();
      let problemList = "";
      const groups = await zabbix.request("hostgroup.get", {});
      const groupId = groups[groups.length - 1].groupid;
      const host = await zabbix.request("problem.get", {
        groups: [{ groupid: groupId }],
        output: "extend",
        selectAcknowledges: "extend",
        selectTags: "extend",
        selectSuppressionData: "extend",
        recent: true,
        sortfield: ["eventid"],
        sortorder: "DESC",
        interfaces: [
          {
            type: 1,
            main: 1,
            useip: 1,
            ip: "127.0.0.1",
            dns: "",
            port: "10050",
          },
        ],
      });

      for (let i = 0; i < host.length; i++) {
        problemList+=(host[i].name);
      }
      console.log(problemList);
      zabbix.logout();
      return problemList;
    } catch (error) {
      console.error(error);
    }
  },
};
