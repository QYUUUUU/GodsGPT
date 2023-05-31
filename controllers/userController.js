const twig = require('twig');

exports.index = (req, res) => {
// Logic for user index page
const data = { name: 'John Doe' };
res.render('../views/index.html.twig', data);
};