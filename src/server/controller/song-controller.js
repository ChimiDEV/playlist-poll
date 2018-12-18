const Song = require('../schema/song');

module.exports.all = async ctx => {
  ctx.body = await Song.find();
};

module.exports.get = async ctx => {
  const { id: _id } = ctx.params;
  const docs = await Song.find({ _id });
  ctx.body = docs[0];
};

module.exports.post = async ctx => {
  const { song, votes } = ctx.request.body;
  if (!song || !votes) {
    ctx.throw(500, `Missing song or votes property`);
  }

  // TODO: Check if song already exists in DB
  
  const songDoc = new Song({
    song,
    votes
  });
  try {
    await songDoc.save();
    ctx.body = { success: true };
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports.put = async ctx => {
  const { id: _id } = ctx.params;
  const { voter, upvote } = ctx.request.body;

  // Check voter against used credentials
  if (!checkUser(ctx.state.credentials, voter)) {
    ctx.status = 401;
    ctx.body = 'Unauthorized';
    return
  }
  const songDoc = await Song.findById(_id);

  // Check if voter already voted
  const filteredVoter = songDoc.votes.filter(val => val.voter === voter);
  const didVote = filteredVoter.length >= 1;
  if (didVote && filteredVoter[0].upvote === upvote) {
    ctx.status = 406;
    ctx.body = { success: false, msg: 'You have already voted' };
    return;
  } else if (didVote && filteredVoter[0].upvote !== upvote) {
    // Changed his mind
    ctx.body = { success: true, msg: 'You have changed your vote' };
    songDoc.votes.forEach(vote => {
      if (vote.voter === voter) {
        vote.upvote = !vote.upvote;
      }
    });
    try {
      await songDoc.save();
      ctx.body = { success: true };
    } catch (err) {
      ctx.throw(err);
    }
  } else if (!didVote) {
    // First vote
    ctx.body = { success: true, msg: 'You have voted' };
    songDoc.votes.push({ voter, upvote });
    try {
      await songDoc.save();
      ctx.body = { success: true };
    } catch (err) {
      ctx.throw(err);
    }
  }
};

module.exports.delete = async ctx => {
  if (ctx.state.credentials.encoded !== process.env.API_KEY_TIM) {
    // Only Admin is allowed to delete Songs
    ctx.status = 401;
    ctx.body = 'Unauthorized';
    return;
  }

  const { id: _id } = ctx.params;
  try {
    await Song.deleteOne({ _id });
    ctx.body = { success: true };
  } catch (err) {
    ctx.throw(err);
  }
};

function checkUser(credentials, user) {
  return credentials.username === user;
}