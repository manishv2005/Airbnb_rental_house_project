

exports.validate_step2_data = (req, res, next) => {
    const hashid = req.params.homeId;
    try {
        // Step 1: Safe Parsing
        const data = JSON.parse(req.body.bedroomData);

        // Step 2: Check if it's an Array
        if (!Array.isArray(data)) {
            return res.redirect(`/host/add-home-step2/${hashid}?error=${encodeURIComponent("Invalid data format received.")}`);
        }

        // Step 3: Loop through each room and validate its structure
        for (let i = 0; i < data.length; i++) {
            const room = data[i];

            // A. Check required fields and their Data Types
            if (
                typeof room.room_number !== 'number' ||
                typeof room.is_ensuite !== 'boolean' ||
                typeof room.beds !== 'object' || 
                room.beds === null
            ) {
                return res.redirect(`/host/add-home-step2/${hashid}?error=${encodeURIComponent("Invalid data format received.")}`);
            }

            // B. Validate Bed Counts (Must be integers and >= 0)
            const { double, single } = room.beds;
            if (
                !Number.isInteger(double) || double < 0 ||
                !Number.isInteger(single) || single < 0
            ) {
                return res.redirect(`/host/add-home-step2/${hashid}?error=${encodeURIComponent('invalid data')}`);
            }
        }

        // Agar sab kuch theek hai, toh parsed data return karo
        next();

    } catch (error) {
        console.log(error.message);
        return res.redirect(`/host/add-home-step2/${hashid}?error=${encodeURIComponent("invalid data")}`)
    }
};

