const mongoose = require('mongoose');
const Court = mongoose.model('Court');

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addCourt = (req, res) => {
  res.render('editCourt', { title: 'Add Court' })
}

exports.createCourt = async (req, res) => {
  const court = await (new Court(req.body)).save();
  await court.save();
  req.flash('success', `Sucessfully created ${court.name}.`)
  res.redirect(`/court/${court.slug}`);
}

exports.getCourt = async (req, res) => {
  const courts = await Court.find();
  console.log(courts);
  res.render('courts', { title: 'Courts', courts })
}