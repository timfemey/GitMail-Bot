const dotenv = require("dotenv");
dotenv.config();
const { Email } = require("email");
const axios = require("axios").default;

//use oauth

module.exports = (bot) => {
  bot.on("issue_comment.created", async (actions) => {
    const { body } = actions.payload.issue; //Comment
    let repo = actions.payload.repository; //Repository where issue comment is made
    let str = String(body);
    str = str.replace("!gitmail", "");
    const comment = actions.issue({
      body: body.includes("!gitmail")
        ? str.length > 50
          ? `Sent message to owner(${repo.owner.login}) of repo, Message: \n ${str}`
          : "Characters must be more than 50 and contain !gitmail to send mail to owner of repo :)"
        : "",
    }); // Set Bot Comment in body property

    let repoOwnerURL = repo.owner.url; //Owner of Repo
    let data = await axios.get(repoOwnerURL, {
      responseType: "json",
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    let email = data.data.email;
    if (email == null) email = "";

    let mail = new Email({
      from: `Your Github Repo ${repo.name} `,
      to: `isholaobafemi@gmail.com`,
      subject: `Message from your Github Repo : ${repo.name} `,
      body: str,
    }); //Email Owener of Repo

    //Send Mail
    if (comment.body != "")
      mail.send((err) => {
        bot.log.error(err);
        return actions.octokit.issues.createComment(`Error Occured`);
      });

    return actions.octokit.issues.createComment(comment); //Bot should make Comment in response
  });
};
