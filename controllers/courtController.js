exports.homePage = (req, res) => {
  res.render('index');
}

exports.addCourt = (req, res) => {
  res.render('editCourt', { title: 'Add Court' })
}

exports.createCourt = (req, res) => {
  res.json(req.body);
}