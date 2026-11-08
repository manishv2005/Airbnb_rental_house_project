const fs = require('fs');
let content = fs.readFileSync('d:/web d course/AIrbnb_project/airbnb/controller/host-edithome-controller.js', 'utf8');
content = content.replace(/res\.redirect\(`\/host\/add-home-step/g, 'res.redirect(`/host/edit-home-step');
content = content.replace(/res\.redirect\('\/host\/add-home-step/g, 'res.redirect(\'/host/edit-home-step');
content = content.replace(/res\.redirect\("\/host\/add-home-step/g, 'res.redirect("/host/edit-home-step');
content = content.replace(/res\.render\("\.\/host\/add-home-step(\d)", \{/g, 'res.render("./host/add-home-step$1", { editing: true, ');
fs.writeFileSync('d:/web d course/AIrbnb_project/airbnb/controller/host-edithome-controller.js', content);
console.log('done');
