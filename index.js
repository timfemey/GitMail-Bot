const dotenv = require("dotenv");
dotenv.config();
const { Email } = require("email");

const axios = require("axios").default;
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cert = fs.readFileSync("gitmail-bot.2022-03-31.private-key.pem");
const token = jwt.sign({ iss: "YOUR APP_ID" }, cert, {
  algorithm: "RS256",
  expiresIn: "10m",
});
//use oauth

module.exports = (bot) => {
  bot.on("issue_comment.created", async (actions) => {
    const body = actions.payload.comment.body; //Comment
    const { type } = actions.payload.sender;
    if (type === "Bot") {
      return;
    }
    let repo = actions.payload.repository; //Repository where issue comment is made
    let str = String(body);
    console.log(str);
    str = str.replace("!gitmail", "");
    const comment = actions.issue({
      body: String(body).includes("!gitmail")
        ? str.length > 50
          ? `Sent message to owner(${repo.owner.login}) of repo, Message: \n ${str}`
          : "Characters must be more than 50 and contain !gitmail to send mail to owner of repo :)"
        : "",
    }); // Set Bot Comment in body property

    if (comment.body == "") {
      return;
    }

    let repoOwnerDetails = repo.owner; //Owner of Repo
    let Id = await axios.get(
      `https://api.github.com/repos/${repoOwnerDetails.login}/${repo.name}/installation`,
      {
        responseType: "json",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let installationId = Id.data.id;
    let access = await axios.post(
      ` https://api.github.com/app/installations/${installationId}/access_tokens`,
      "",
      {
        responseType: "json",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    let accessToken = access.data.token;

    let email = await axios.get(`${repoOwnerDetails.url}`, {
      responseType: "json",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${accessToken}`,
      },
    });

    let email_addr = email.data.email;
    if (email_addr == null) {
      return actions.octokit.issues.createComment(
        "Repository Owner doesnt have a Public Email Address \n Cant Send this Message \n Repository Owner shoud have a  ublic email address in Github Settings"
      );
    }

    let mail = new Email({
      from: `Your Github Repo ${repo.name} `,
      to: `isholaobafemi@gmail.com`,
      subject: `Message from your Github Repo : ${repo.name} `,
      body: str === "" ? "Nothing" : str,
    }); //Email Owner of Repo

    //Send Mail

    if (comment.body === "") {
      console.log("Hmmm");
    } else {
      mail.send((err) => {
        bot.log.error(err);
      });
      return actions.octokit.issues.createComment(comment);
    }

    //Bot should make Comment in response
  });
};
