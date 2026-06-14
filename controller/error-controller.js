

exports.getpage404 = (req, res) => {
    res.status(404).render('pagenotfound');
}

exports.getpage500 = (req, res) => {
    res.status(500).render('servererror');
}