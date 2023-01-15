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

exports.editCourt = async (req, res) => {
  const court = await Court.findOne({_id: req.params.id});
  res.render('editCourt', { title: `Edit ${court.name}`, court});
}

exports.updateCourt = async (req, res) => {
  const court = await Court.findOneAndUpdate({ _id: req.params.id}, req.body, {
    new: true,
    runValidators: true
  }).exec();

  req.flash('success', `Updated ${court.name} <a href="/courts/${court.slug}"> View Court </a>`);
  res.redirect(`/courts/${court._id}/edit`);
}