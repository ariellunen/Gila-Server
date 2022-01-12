const express = require("express");
const cors = require("cors");
const config = require("./config");
const https = require('https');
const fs = require('fs');
const handleWebhook = require("./handleWebhook");
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // parsing
console.log(config);
const PORT = config.PORT || 5050;

const port = 7001;
const httpsServer = https.createServer({
 // key: fs.readFileSync('/etc/letsencrypt/live/my_api_url/privkey.pem'),
  //cert: fs.readFileSync('/etc/letsencrypt/live/my_api_url/fullchain.pem'),
    key: fs.readFileSync('./gila.key'),
    cert: fs.readFileSync('./gila.cert'),
}, app);

httpsServer.listen(port, () => {
	console.log('HTTPS Server listening on port ' + port);
    //console.log('HTTPS Server running on port 5050');
});
app.listen(PORT, () => {
  console.log(`Gila node server listening at http://localhost:${PORT}`);
});

app.post("/", async (req, res) => {
  try {

    const ans = await handleWebhook.checkRequest(req.body);
    if (req.body == undefined) {
      res.status(404).json({ Error: "Something went wrong" });
    } else if (ans == "create") {
      const createHost = await handleWebhook.createRequest(req.body);
      res.status(200).json({
        payload: {
          google: {
            expectUserResponse: false,
            richResponse: {
              items: [
                {
                  simpleResponse: {
                    textToSpeech: `Created host ${createHost}`,
                  },
                },
              ],
            },
          },
        },
      });
    } else if (ans == "problem") {
      const problems = await handleWebhook.problemsRequest(req.body);
      res.status(200).json({
        payload: {
          google: {
            expectUserResponse: false,
            richResponse: {
              items: [
                {
                  simpleResponse: {
                    textToSpeech: problems,
                  },
                },
              ],
            },
          },
        },
      });
    }
    else if (ans == "deleted") {
        const deleteHost = await handleWebhook.deleteRequest(req.body);
        res.status(200).json({
          payload: {
            google: {
              expectUserResponse: false,
              richResponse: {
                items: [
                  {
                    simpleResponse: {
                      textToSpeech: `Deleted host ${deleteHost}`,
                    },
                  },
                ],
              },
            },
          },
        });
      }
  } catch {
    res.status(404).json({ Error: "Something went wrong" });
  }
});
