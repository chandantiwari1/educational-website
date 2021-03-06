const mongoose = require("mongoose");

const Question = require("../../models/question");
const User = require("../../models/people");
const Settings = require("../../models/settings");
const Category = require("../../models/category");

const transporter = require("../../utils/emailTransporter");

module.exports = function (agenda) {
  agenda.define("repetition", async (job, done) => {
    await mongoose.connect(process.env.MONGO_URL);

    const { userId, questions } = job.attrs.data;

    try {
      const user = await User.findOne({ _id: userId });

      if (!user) {
        done();
        return;
      }

      // show the question again to the user in checking phase
      await Question.updateMany({ _id: { $in: questions } }, { $pull: { knownUsers: user._id } });
      await Question.updateMany({ _id: { $in: questions } }, { $pull: { unknownUsers: user._id } });
      await Question.updateMany({ _id: { $in: questions } }, { $pull: { packUsers: user._id } });

      // mark the user as repeated
      await Question.updateMany(
        { _id: { $in: questions } },
        { $push: { repeatedUsers: user._id } }
      );

      const product = await Category.findOne({ questions: { $in: questions } });

      let emailText = (await Settings.findOne({})).requestMessage
        .replace(/{{name}}/g, user.firstName)
        .replace(/{{product}}/g, product.name)
        .split("\n")
        .filter((_, index) => index !== 0)
        .join("<br />");

      const emailSubject = (await Settings.findOne({})).requestMessage
        .replace(/{{name}}/g, user.firstName)
        .split("\n")[0];

      // for inserting a link in the {{link}} placeholder
      const { link, linkText } = JSON.parse(emailText.split("<br />")[0]) || {
        link: process.env.APP_URL,
        linkText: "Visit webpage",
      };
      const linkHTML = `<a href="${link}">${linkText}</a>`;

      emailText = emailText
        .replace(/{{link}}/g, linkHTML)
        .split("<br />")
        .filter((_, index) => index !== 0)
        .join("<br />");

      // after all send the user a reminder about it through mail
      await transporter.sendMail({
        from: `EDconsulting<${process.env.EMAIL}>`,
        to: user.email,
        subject: emailSubject,
        html: emailText,
      });

      done();
    } catch (err) {
      console.log(err.message || err);
      done();
    }
  });
};
