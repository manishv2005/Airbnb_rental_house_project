const { Home } = require('../models/model');
const fs = require('fs');
const path = require('path');
const { hashids } = require('../utils/util');
const { location: Location } = require('../models/location');
const { common_rules } = require('../models/common-rules');
const { PROPERTY_IMAGES } = require('../models/property_images');
const { get_property_types, property_type_id_validation } = require('../models/property_type')
const { listing_type, listing_type_id_validation } = require('../models/listing_type')
const { decode_homeID } = require('../utils/helper_function');
const { location_verification } = require('../utils/helper_function');


function hasValidBedrooms(home) {
    if (!home || !home[0]) return false;
    let details = home[0].bedrooms_details;
    if (!details) return false;
    if (typeof details === 'string') {
        try { details = JSON.parse(details); }
        catch (e) { return false; }
    }
    if (!Array.isArray(details) || details.length === 0) return false;
    details.forEach((room) => {
        if (!room || typeof room.room_number !== 'number' || typeof room.beds !== 'object' || typeof room.is_ensuite !== 'boolean') {
            return false;
        }
    });
    return true;
}



// getHomes function has been removed as homes.ejs is no longer needed.


exports.getEditHomeStep1 = async (req, res) => {
    let home = [];
    try {
        console.log('this is ', req.query.id)
        const secureId = req.query.id;
        if (secureId || typeof secureId == 'string' || secureId.length == 8) {

            const home_id = decode_homeID(secureId);
            if (home_id) {
                [home] = await Home.getAuthorizedHome_for_edit(home_id, req.session.host.hostId);
                if (!home && home.length === 0) {
                    return res.redirect(`/host?error=${encodeURIComponent("home not found")}`);
                }
                home[0].id = secureId;
                console.log(home[0]);
            }

        }

        const [propertyTypes] = await get_property_types();
        const [listingTypes] = await listing_type();
        const errors = req.query.error ? [req.query.error] : [];
        res.render("./host/add-home-step1", {
            editing: true,
            errors,
            oldInput: (home[0]) ? home[0] : '',
            propertyTypes,
            listingTypes,
            user: req.session.user,
            activePage: 'add-home'
        })
    }


    catch (err) {
        console.error('Error getting add home step 1:', err);
        res.redirect(`/host?error=${encodeURIComponent("Error in getting add home step 1")}`);
    }

}
    ;





exports.postEditHomeStep1 = async (req, res) => {
    try {
        const { property_type_id, listing_type_id, max_guests, total_bedrooms, total_bathrooms, id } = req.body;
        console.log(id);
        let homeId = null;
        if (id) {
            homeId = decode_homeID(id);
            console.log("this is home id", homeId);
            const [home] = await Home.getAuthorizedHome_for_edit(homeId, req.session.host.hostId);
            console.log("first home is", home);
            if (!home && home.length === 0) {
                return res.redirect(`/host?error=${encodeURIComponent("home not found")}`);
            }
        }

        const isvalid_property_type_id = await property_type_id_validation(property_type_id);
        if (!isvalid_property_type_id) {
            return res.redirect(`/host/edit-home-step1?error=${encodeURIComponent("bad request")}`);
        }

        const isvalid_listing_type_id = await listing_type_id_validation(listing_type_id);
        if (!isvalid_listing_type_id) {
            return res.redirect(`/host/edit-home-step1?error=${encodeURIComponent("bad request")}`);
        }

        const home = new Home(property_type_id, listing_type_id, max_guests, total_bedrooms, total_bathrooms, req.session.host.hostId, homeId);
        console.log("home is", home);
        const [save_result] = await home.edit_first_step();
        if (!save_result || save_result.affectedRows === 0) {
            return res.redirect(`/host/edit-home-step1?error=${encodeURIComponent("Error in saving home")}`);
        }
        if (!homeId) {
            homeId = save_result.insertId;
        }
        secure_id = hashids.encode(homeId);

        res.redirect(`/host/edit-home-step2/${secure_id}`);

    } catch (err) {
        console.error('Error adding home step 1:', err);
        res.redirect(`/host/error=${encodeURIComponent("server error ")}`);
    }
};


exports.getEditHomeStep2 = async (req, res) => {

    try {

        const home_id = decode_homeID(req.params.homeId);
        const hostId = req.session.host.hostId;
        console.log("this is home id and host id", home_id, hostId);

        const [home] = await Home.getAuthorizedHome_for_edit(home_id, hostId);
        if (!home || home.length === 0) {
            return res.redirect(`/host?error=${encodeURIComponent("authorization error")}`);
        }

        total_bathrooms = home[0].total_bathrooms;
        total_bedrooms = home[0].total_bedrooms;


        console.log("total bathrooms", total_bathrooms);
        console.log("total bedrooms", total_bedrooms);

        let oldInput = '[]';
        if (home[0].bedrooms_details) {
            oldInput = JSON.stringify(home[0].bedrooms_details);
        }



        const errors = req.query.error ? [req.query.error] : [];

        res.render("./host/add-home-step2", {
            editing: true,
            errors: errors,
            total_bathrooms,
            total_bedrooms,
            oldInput: oldInput,
            secure_id: req.params.homeId,
            user: req.session.user,
            activePage: 'add-home'
        })

    }

    catch (err) {
        console.error("Error in fetching home for step 2", err);
        res.redirect(`/host?error=${encodeURIComponent("server error")}`);
    }
}





exports.postEditHomeStep2 = async (req, res) => {
    try {

        const home_id = decode_homeID(req.params.homeId);
        const hostId = req.session.host.hostId;

        const [home] = await Home.getAuthorizedHome_for_edit(home_id, hostId);
        if (!home || home.length === 0) {
            return res.redirect(`/host?error=${encodeURIComponent("authorization error")}`);
        }

        const total_bedrooms = home[0].total_bedrooms;
        const total_bathrooms = home[0].total_bathrooms;

        const bedroomData = JSON.parse(req.body.bedroomData);

        if (bedroomData.length !== total_bedrooms) {
            return res.redirect(`/host/edit-home-step2/${req.params.homeId}?error=${encodeURIComponent("Number of bedrooms should match the total bedrooms")}`);
        }
        let attach_bathroom_count = 0;
        for (let i = 0; i < total_bedrooms; i++) {
            if (bedroomData[i].is_ensuite === true) {
                attach_bathroom_count += 1;
            }
        }

        if (attach_bathroom_count > Math.ceil(total_bathrooms)) {
            return res.redirect(`/host/edit-home-step2/${req.params.homeId}?error=${encodeURIComponent("Attached bathrooms cannot be greater than total bathrooms")}`);
        }


        const [updated_home] = await Home.save_second_step2(bedroomData, home_id, hostId);
        if (updated_home?.affectedRows === 0) {
            return res.redirect(`/host/edit-home-step2/${req.params.homeId}?error=${encodeURIComponent("Error in updating home")}`);
        }
        res.redirect(`/host/edit-home-step3/${req.params.homeId}`);
    }
    catch (err) {
        console.error("Error in fetching home for step 3", err);
        res.redirect(`/host/edit-home-step2/${req.params.homeId}?error=${encodeURIComponent("server error")}`);
    }
}




exports.getEditHomeStep3 = async (req, res) => {
    try {
        const home_id = decode_homeID(req.params.homeId);
        const hostId = req.session.host.hostId;

        const [home] = await Home.getAuthorizedHome_for_edit(home_id, hostId);
        if (!hasValidBedrooms(home)) {
            return res.redirect(`/host?error=${encodeURIComponent("You don't own this home or home is not registered")}`);
        }

        let oldInput = {};

        const [location] = await Location.find_location(home_id);
        if (location && location.length > 0) {
            oldInput = location[0];
        }

        const errors = req.query.error ? [req.query.error] : [];

        res.render("./host/add-home-step3", {
            editing: true,
            errors: errors,
            oldInput: oldInput,
            user: req.session.user,
            secure_id: req.params.homeId,
            activePage: 'add-home',
            key: process.env.KEY,
        })

    }

    catch (err) {
        console.error("Error in fetching home for step 3", err);
        res.redirect(`/host?error=${encodeURIComponent("server error")}`);
    }
}



exports.postEditHomeStep3 = async (req, res) => {

    try {
        const home_id = decode_homeID(req.params.homeId);
        const hostId = req.session.host.hostId;

        const [home] = await Home.getAuthorizedHome_for_edit(home_id, hostId);
        if (!hasValidBedrooms(home)) {
            return res.redirect(`/host?error=${encodeURIComponent("You don't own this home or home is not registered")}`);
        }

        const { flat_no, city, state, country, pincode, street_address, landmark, latitude, longitude } = req.body;


        const address = await location_verification(longitude, latitude);


        let extracted_city = "";
        let extracted_state = "";
        let extracted_country = "";
        let extracted_pincode = "";

        if (address.address) {
            // Nominatim OpenStreetMap Format
            extracted_city = address.address.city || address.address.town || address.address.village || address.address.county || address.address.state_district || address.address.suburb || "";
            extracted_state = address.address.state || address.address.region || "";
            extracted_country = address.address.country || "";
            extracted_pincode = address.address.postcode || "";
        } else if (address.address_components) {
            // Google Maps Format
            const components = address.address_components;
            const getComponent = (type) => {
                return components.find(c => c.types.includes(type))?.long_name || "";
            };
            extracted_city = getComponent('locality');
            extracted_state = getComponent('administrative_area_level_1');
            extracted_country = getComponent('country');
            extracted_pincode = getComponent('postal_code');
        }



        const match = (google, user) => {
            return google.trim().toLowerCase() === user.trim().toLowerCase();
        }

        console.log("extracted_city", extracted_city, "/tcity", city);
        console.log("extracted_state", extracted_state, "/tstate", state);
        console.log("extracted_country", extracted_country, "/tcountry", country);
        console.log("extracted_pincode", extracted_pincode, "/tpincode", pincode);


        if (match(extracted_city, city) && match(extracted_country, country) && match(extracted_state, state) && match(extracted_pincode, pincode)) {
            const location = new Location(flat_no, home_id, city, state, country, pincode, street_address, landmark, latitude, longitude);
            const [saved_location] = await location.save_location();
            if (!saved_location || saved_location.affectedRows === 0) {
                return res.redirect(`/host/edit-home-step3/${req.params.homeId}?error=${encodeURIComponent("Error in saving location")}`);
            }
            res.redirect(`/host/edit-home-step4/${req.params.homeId}`);
        } else {
            return res.redirect(`/host/edit-home-step3/${req.params.homeId}?error=${encodeURIComponent("Location is not matching")}`);
        }
    }
    catch (err) {
        console.error("Error in adding home step 3", err);
        res.redirect(`/host/edit-home-step3/${req.params.homeId}?error=${encodeURIComponent("server error")}`);
    }
}



exports.getEditHomeStep4 = async (req, res) => {

    try {
        const home_id = decode_homeID(req.params.homeId);
        const hostId = req.session.host.hostId;

        const [home] = await Home.getAuthorizedHome_for_edit(home_id, hostId);
        if (!hasValidBedrooms(home)) {
            return res.redirect(`/host?error=${encodeURIComponent("authorization error")}`);
        }

        const [home_location] = await Location.find_location(home_id);
        if (!home_location || home_location.length === 0) {
            return res.redirect(`/host?error=${encodeURIComponent("bad request")}`);
        }

        let oldInput = {};


        if (home && home.length > 0 && home[0].price) {
            oldInput.price = home[0].price;
        }

        const errors = req.query.error ? [req.query.error] : [];

        res.render("./host/add-home-step4", {
            editing: true,
            errors: errors,
            oldInput: oldInput,
            secure_id: req.params.homeId,
            user: req.session.user,
            activePage: 'add-home'
        })

    }

    catch (err) {
        console.error("Error in fetching home for step 3", err);
        res.redirect(`/host?error=${encodeURIComponent("server error")}`);
    }
}






exports.postEditHomeStep4 = async (req, res) => {

    try {
        const home_id = decode_homeID(req.params.homeId);
        const hostId = req.session.host.hostId;

        const [home] = await Home.getAuthorizedHome_for_edit(home_id, hostId);
        if (!hasValidBedrooms(home)) {
            const files = req.files;
            if (files && files.length > 0) {
                // Delete uploaded files
                files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error("Error deleting file:", err);
                    });
                });
            }
            return res.redirect(`/host?error=${encodeURIComponent("authorization error")}`);
        }


        const [home_location] = await Location.find_location(home_id);
        if (!home_location || home_location.length === 0) {
            const files = req.files;
            if (files && files.length > 0) {
                // Delete uploaded files
                files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error("Error deleting file:", err);
                    });
                });
            }
            return res.redirect(`/host?error=${encodeURIComponent("bad request")}`);

        }



        // we check does homes exists in the table or not 
        const [home_images] = await PROPERTY_IMAGES.fetch_by_home_id(home_id);
        console.log(home_images.length);

        if ((!req.files || req.files.length === 0) && home_images?.length >= 5) {
            const save_price = await Home.save_home_price(req.body.price, home_id, hostId);
            if (!save_price || save_price.affectedRows === 0) {
                return res.redirect(`/host/edit-home-step4/${req.params.homeId}?error=${encodeURIComponent("Error in saving price")}`);
            }
            return res.redirect(`/host/edit-home-step5/${req.params.homeId}`);
        }


        if (req.files.length < 5) {
            console.log(req.files.length);
            console.log(req.files);
            const files = req.files;
            if (files && files.length > 0) {
                // Delete uploaded files
                files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error("Error deleting file:", err);
                    });
                });
            }
            return res.redirect(`/host/edit-home-step4/${req.params.homeId}?error=${encodeURIComponent("uploads at least 5 images")}`);
        }


        const db = require('../utils/database');
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {

            const save_price = await Home.save_home_price(req.body.price, home_id, hostId,connection);
            if (!save_price || save_price.affectedRows === 0) {
                return res.redirect(`/host/edit-home-step4/${req.params.homeId}?error=${encodeURIComponent("Error in saving price")}`);
            }

            const images = req.files;


            if (!home_images || home_images.length === 0) {

                const results = await Promise.all(images.map(async (image, index) => {
                    const is_cover_page = index === 0 ? true : false;
                    const property_image = new PROPERTY_IMAGES(home_id, image.path, is_cover_page);
                    return await property_image.save_property_images(connection);

                }));


                results.forEach((result) => {
                    // db.execute returns [rows, fields]
                    const rows = result[0];
                    if (!rows || rows.affectedRows === 0) {
                        throw new Error("Error in saving property images");
                    }
                });

                await connection.commit();
                return res.redirect(`/host/edit-home-step5/${req.params.homeId}`);
            }


            const [delete_homes_images] = await PROPERTY_IMAGES.delete_by_home_id(home_id,connection);
            console.log("delete_homes_images.affectedRows", delete_homes_images.affectedRows);
            if (delete_homes_images?.affectedRows !== 5) {
                throw new Error("Error in deleting property images");
            }


            // now we  update the image path in the property images table for the cover page
            const update_cover_image = await Promise.all(images.map(async (image, index) => {
                const is_cover_page = index === 0 ? true : false;
                const property_image = new PROPERTY_IMAGES(home_id, image.path, is_cover_page);
                return await property_image.save_property_images();

            }));

            update_cover_image.forEach((result) => {
                // db.execute returns [rows, fields]
                const rows = result[0];
                if (!rows || rows.affectedRows === 0) {
                    throw new Error("Error in updating property images");
                }
            });

            await connection.commit();
            return res.redirect(`/host/edit-home-step5/${req.params.homeId}`);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    }
    catch (err) {
        console.error("Error in fetching home for step 4", err);
        res.redirect(`/host/edit-home-step4/${req.params.homeId}?error=${encodeURIComponent("server error")}`);
    }
}



exports.getEditHomeStep5 = async (req, res) => {

    try {
        const home_id = decode_homeID(req.params.homeId);
        const hostId = req.session.host.hostId;
        const [home] = await Home.getAuthorizedHome_for_edit(home_id, hostId);

        if (!hasValidBedrooms(home)) {
            return res.redirect(`/host?error=${encodeURIComponent("authetication error")}`);
        }

        const [home_location] = await Location.find_location(home_id);
        if (!home_location || home_location.length === 0) {
            return res.redirect(`/host?error=${encodeURIComponent("bad request")}`);
        }


        const [property_image] = await PROPERTY_IMAGES.fetch_by_home_id(home_id);
        if (!property_image || property_image.length === 0) {
            return res.redirect(`/host?error=${encodeURIComponent("bad request")}`);
        }


        const [commonRules] = await common_rules.get_all_rules();



        let oldInput = {
            houseName: home[0].name || "",
            description: home[0].description || "",
            rules: home[0].rules || []

        };

        console.log(typeof home[0].rules);
        console.log(home[0].rules);



        const errors = req.query.error ? [req.query.error] : [];

        res.render("./host/add-home-step5", {
            editing: true,
            errors: errors,
            oldInput: oldInput,
            user: req.session.user,
            activePage: 'add-home',
            commonRules: commonRules,
            homeId: req.params.homeId
        })

    }

    catch (err) {
        console.error("Error in fetching home for step 3", err);
        res.redirect(`/host?error=${encodeURIComponent("server error")}`);
    }
}



exports.postEditHomeStep5 = async (req, res) => {
    try {
        const home_id = decode_homeID(req.params.homeId);
        const hostId = req.session.host.hostId;
        const [home] = await Home.getAuthorizedHome_for_edit(home_id, hostId);

        if (!hasValidBedrooms(home)) {
            return res.status(422).json({ message: "authetication error" });
        }

        const [home_location] = await Location.find_location(home_id);
        if (!home_location || home_location.length === 0) {
            return res.status(422).json({ message: "bad request" });
        }


        const [property_image] = await PROPERTY_IMAGES.fetch_by_home_id(home_id);
        if (!property_image || property_image.length === 0) {
            return res.status(422).json({ message: "bad request" });
        }



        const { houseName, description, rules } = req.body;

        // so first we get all the rule ids 
        const [all_rules] = await common_rules.get_all_rules();
        const rule_ids = all_rules.map(rule => rule.rule_id);

        const is_all_valid_id = rules.selectedCommonRules.every((rule) => {
            return rule_ids.includes(rule);
        });

        if (!is_all_valid_id) {
            return res.status(422).json({ message: "Invalid rule id" });
        }





        const [save_rules_result] = await Home.save_home_rules(JSON.stringify(rules.selectedCommonRules), home_id, hostId, houseName, description);
        if (!save_rules_result || save_rules_result.affectedRows === 0) {
            return res.status(422).json({ message: "Error in saving rules" })
        }

        return res.status(200).json({ message: "Success" });




    }

    catch (err) {
        console.error("Error in fetching home for step 5", err);
        res.status(500).json({ message: "server error" });
    }
}






