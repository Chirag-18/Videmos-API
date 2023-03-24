const { Agenda } = require("agenda");
const agenda = new Agenda({ db: { address: process.env.MONGODB_URL } });

const User = require("../models/userModel");

const startAgenda = async () => {
  await agenda.start();

  agenda.define("delete unverified user", async (job, done) => {
    const userId = job.attrs.data.userId;
    const user = await User.findById(userId);

    if (user && !user.isVerified && user.optExpiresAt < Date.now()) {
      await User.deleteOne({ _id: user._id });
    }

    done();
  });
};

module.exports = startAgenda;