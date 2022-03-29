module.exports = (bot) => {
  bot.on("issues.opened", async (actions) => {
    const { body } = actions.payload.issue;
    let str = String(body).replace("!gitmail", "");
    const comment = actions.issue({
      body:
        body.includes("!gitmail") && str.length > 50
          ? `Sent message to owner of repo \n ${str}`
          : "Characters must be more than 50 and contain !gitmail to send mail to owner of repo :)",
    });
  });
};
