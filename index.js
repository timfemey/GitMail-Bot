const dotenv = require("dotenv");
dotenv.config();
const { Email } = require("email");

module.exports = (bot) => {
  bot.on("issue_comment.created", async (actions) => {
    const { body } = actions.payload.issue;
    let str = String(body);
    str = str.replace("!gitmail", "");
    const comment = actions.issue({
      body: body.includes("!gitmail")
        ? str.length > 50
          ? `Sent message to owner of repo, Message: \n ${str}`
          : "Characters must be more than 50 and contain !gitmail to send mail to owner of repo :)"
        : false,
    });
    const { repo } = comment;
    bot.log(`Comment: ${comment}`);
    let mail = new Email({
      from: `Your Github Repo ${repo} `,
      to: `isholaobafemi@gmail.com`,
      subject: `Message from your Github Repo : ${repo} `,
      body: comment.body,
    });
    mail.send((err) => {
      bot.log.error(err);
      return actions.octokit.issues.createComment(`Error Occured`);
    });
    return actions.octokit.issues.createComment(comment);
  });
  bot.on("issues.opened", async (actions) => {
    const { body } = actions.payload.issue;
    let str = String(body);
    str = str.replace("!gitmail", "");
    const comment = actions.issue({
      body: body.includes("!gitmail")
        ? str.length > 50
          ? `Sent message to owner of repo, Message: \n ${str}`
          : "Characters must be more than 50 and contain !gitmail to send mail to owner of repo :)"
        : false,
    });
    const { repo } = comment;
    let mail = new Email({
      from: `Your Github Repo ${repo} `,
      to: `isholaobafemi@gmail.com`,
      subject: `Message from your Github Repo : ${repo} `,
      body: comment.body,
    });
    mail.send((err) => {
      bot.log.error(err);
      return actions.octokit.issues.createComment(`Error Occured`);
    });
    return actions.octokit.issues.createComment(comment);
  });
};

// http
//   .createServer(() => {
//     console.warn("Server is Running");
//   })
//   .listen(port);
