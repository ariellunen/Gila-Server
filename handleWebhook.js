const axios = require("axios").default;
const config = require("./config");
const Zabbix = require("zabbix-promise");
const SlackWebhook = require("slack-webhook");

const URL = config.URL;
const ADDRESS = config.ADDRESS;
const SLACK = config.SLACK;

const zabbix = new Zabbix({
  url: config.URL,
  user: config.User,
  password: config.Password,
});

const slack = new SlackWebhook(SLACK);

const zabbixSender = async (key, value, host) => {
  try {
    const result = await Zabbix.sender({
      server: ADDRESS,
      key,
      value,
      host,
    });
    console.log(result);
    console.log(ADDRESS);
  } catch (error) {
    console.error(error);
  }
};
const slackSender = async (reqName, status) => {
  const res = status ? "Success" : "Failed";
  const resColor = status ? "#82dd55" : "#e23636";

  try {
    await slack.send({
      attachments: [
        {
          color: resColor,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Request:* ${reqName}`,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Response:* ${res}`,
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "image",
                  image_url: `https://ssl-static.libsyn.com/p/assets/5/b/f/0/5bf0dd70c2b87bb6/AoG.png`,
                  alt_text: "images",
                },
                {
                  type: "mrkdwn",
                  text: `Google Assistant`,
                },
              ],
            },
          ],
        },
      ],
    });
  } catch (error) {
     console.log("slack problem");
    console.log(error);
  }
};

module.exports = {
  checkRequest: async (body) => {
    const requestType = body.queryResult.action;
    console.log(requestType);
    if (requestType.includes("CreateNewHost")) {
      return "create";
    } else if (requestType.includes("ZabbixProblemReport")) {
      return "problem";
    } else if (requestType.includes("DeleteHost")) {
      return "deleted";
    } else {
      return "failed";
    }
  },

  createRequest: async (req) => {
    const hostName = req.queryResult.outputContexts[5].parameters.hostname;
    const description =
      req.queryResult.outputContexts[5].parameters.description;
    try {
      await zabbix.login();
      await zabbixSender("req.create.host", 1, "g");
      const groups = await zabbix.request("hostgroup.get", {});
      const groupId = groups[groups.length - 1].groupid;
      const templateID = await zabbix.request("template.get", {
        output: "extend",
        filter: {
          host: ["Template Monitoring Requests and Responses"],
        },
      });
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

      await zabbixSender("res.create.host", 1, "g");
      await slackSender("Create a new host", 1);

      zabbix.logout();
      return hostName;
    } catch (error) {
      console.error(error);
      await zabbixSender("err.create.host", 3, "g");
      await slackSender("Create a new host", 0);
    }
  },

  problemsRequest: async (req) => {
    try {
      await zabbix.login();
      await zabbixSender("req.list.problems", 1, "g");
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
        problemList += host[i].name;
      }
      console.log(problemList);

      await zabbixSender("res.list.problems", 1, "g");
      await slackSender("List problems", 1);
      zabbix.logout();
      return problemList;
    } catch (error) {
      console.error(error);
      await zabbixSender("err.list.problems", 3, "g");
      await slackSender("List problems", 0);
    }
  },

  deleteRequest: async (req) => {
    try {
      await zabbix.login();
      await zabbixSender("req.delete.host", 1, "g");
      const groups = await zabbix.request("hostgroup.get", {});
      const groupId = groups[groups.length - 1].groupid;
      const hostName = req.queryResult.outputContexts[5].parameters.hostname;
      const hostTemp = await zabbix.request("host.get", {
        output: "extend",
        filter: {
          host: [hostName],
        },
      });
      const hostID = hostTemp[0].hostid;
      console.log(hostID);
      await zabbix.request("host.delete", [hostID]);
      console.log(hostName);
      console.log(hostID);

      await zabbixSender("res.delete.host", 1, "g");
      await slackSender("Delete a host", 1);
      zabbix.logout();
      return hostName;
    } catch (error) {
      console.error(error);
      await zabbixSender("err.delete.host", 3, "g");
      await slackSender("Delete a host", 0);
    }
  },
};
