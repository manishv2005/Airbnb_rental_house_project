const { Home } = require('../models/model');
 const fs = require('fs');
 const path = require('path');


exports.getAddHome = (req, res) => {
    res.render("./host/edithosthome", {
        home: null,
        editing: false,
        activePage: 'add-home',
        user: req.session.user
    });
}



exports.postAddHome = (req, res) => {


    console.log("now PostAddHome is runing ");
    console.log(req.body);
    console.log("this is req.file", req.file);


    const { name, number, price, description, } = req.body;
    const oldInput = { name, number, price, description };


    if (!req.file) {
        console.log("no file is uploaded");
        res.render("./host/edithosthome", {
            home: oldInput,
            editing: false,
            activePage: 'add-home',
            user: req.session.user,
            errors: ['No image uploaded. Please select an image to upload.']
        });
        return;

    }



    const image = req.file.path;
    const hostId = req.session.host.HostId;

    const newHome = new Home(name, number, price, description, image, hostId);
    console.log(" this is the new Home", newHome);

    newHome.save()
        .then(() => res.redirect('/host'))
        .catch(err => {
            console.error('Error saving home:', err);

            if (req.file) {
            const filePath = path.join(__dirname,'../', req.file.path);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return;
                }
                console.log('File deleted successfully:', filePath);
            });
        }
        
            res.status(500).render("./host/edithosthome", {
                home: newHome,
                editing: false,
                activePage: 'add-home',
                user: req.session.user,
                errors: ['Failed to save home. Please try again.']
            });
        });
}


exports.getHostDashboard = async (req, res, next) => {
    try {
        const [host_homes] = await Home.Host_homes(req.session.user.UserId);
        console.log(host_homes) ;
        
        const errors = req.query.error ? [req.query.error] : [];
        
        return res.render("./host/hosthome", {
            houselist : host_homes,
            activePage: 'host-homes',
            user: req.session.user,
            errors: errors
        });
    } catch (error) {
        console.error('Error fetching host homes:', error);
        res.status(500).render("./host/hosthome", {
            houselist: [],
            activePage: 'host-homes',
            user: req.session.user,
            errors: ['Failed to fetch host homes. Please try again.']
        });
    }
}


exports.getEditHome = (req, res, next) => {
    const HomeId = req.params.homeId;
    const editing = req.query.editing === "true";
    Home.fetchHome(HomeId).then(([homes]) => {
        const home = homes[0];
        
        if (!home) {
            console.log("home not found");
            res.redirect("/host");
            return;
        }
        // Ownership check — only the host who owns this listing can edit it
        if (Number(home.hostId) !== Number(req.session.host.HostId)) {
            console.log("Unauthorized edit attempt — home does not belong to this host");
            return res.redirect(`/host?error=${encodeURIComponent("You don't have permission to edit this home")}`);
        }
        const errors = req.query.error ? [req.query.error] : [];
        res.render("./host/edithosthome", {
            home,
            editing,
            activePage: 'host-homes',
            user: req.session.user,
            errors: errors
        });
    }).catch(err => {
        // ✅ FIX: Pehle sirf log hota tha aur browser ghoomta rehta tha (hang)
        // Ab error aane par user ko redirect kar dete hain taaki app stuck na ho
        console.error("SERVER FACING ERR WHILE FETCHING HOME FOR EDITING", err);
        res.redirect(`/host?error=${encodeURIComponent("Error fetching home details")}`);
    });
}


exports.postEditHome = async (req, res) =>  {
    console.log(req.body);
    const { id, name, number, price, description } = req.body;
    let image = null;
    
    try {
        if (req.file) {
            image = req.file.path;
            
            
            const [homes] = await Home.fetchHome(id);
            const oldHome = homes[0];
            if (oldHome && oldHome.image && Number(oldHome.hostId) === Number(req.session.user.UserId)) {
               
                const oldImagePath = path.join(__dirname, '../', oldHome.image);
                fs.unlink(oldImagePath, err => {
                    if (err) {console.error('Error deleting old image file:', err);}
                });
            }
        }
        
        const newHome = new Home(name, number, price, description, image, req.session.user.UserId, id);
        const [temp]= await newHome.save();

        if (temp.affectedRows === 0) {         
            console.log("home not updated");
            if (req.file) {
                const filePath = path.join(__dirname,'../', req.file.path);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                        return;
                    }
                    console.log('File deleted successfully:', filePath);
                });
            }
            res.redirect(`/host/edit-home/${id}?editing=true&error=${encodeURIComponent("Error in updating home")}`);
            return;
        }
        
        console.log('Home updated successfully');
        res.redirect('/host');
    } catch (err) {
        console.error('Error updating home:', err);
        if (req.file) {
            const filePath = path.join(__dirname,'../', req.file.path);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return;
                }
                console.log('File deleted successfully:', filePath);
            });
        }
        res.redirect('/host');
    }
}




exports.postDeleteHome = async (req, res) => {
    const homeId = req.params.homeId;
    const hostId = req.session.user.UserId;  // only delete if this host owns it
    
    try {
        // Fetch home details to get the image path
        const [homes] = await Home.fetchHome(homeId);
        const home = homes[0];
        
        if (home && Number(home.hostId) === Number(hostId)) {
            // Delete record from database
            [deleted]=await Home.deleteHome(homeId, hostId);


            // Delete physical image file
            if (home.image && deleted.affectedRows > 0) {
               
                const imagePath = path.join(__dirname, '../', home.image);
                
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error('Error deleting image file:', err);
                    } else {
                        console.log('Image file deleted:', imagePath);
                    }
                });
            }
        }
        else {
            return res.redirect(`/host?error=${encodeURIComponent("Home not found or you don't have permission to delete it")}`);
        }
        res.redirect('/host');
    } catch (err) {
        console.error('Error deleting home:', err);
        res.redirect(`/host?error=${encodeURIComponent("Error in deleting home")}`);
    }
}

// getHomes function has been removed as homes.ejs is no longer needed.