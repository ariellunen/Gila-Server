const express = require("express");
const cors = require("cors");
//const dotenv =  require('dotenv');
const config = require("./config");

const handleWebhook = require("./handleWebhook");
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // parsing
const PORT = config.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Gila node server listening at http://localhost:${config.PORT}`);
});

app.post("/assistent", async (req, res) => {
  try {
    const ans = await handleWebhook.checkRequest(req.body);
    //TODO: check if there is more param to check if valid
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
