const db = require('../utils/database')
exports.listing_type_id_validation = async(listing_type_id)=> {
    try {
        const [row] = await db.execute('SELECT ls_type_id FROM listing_types WHERE ls_type_id = ?', [listing_type_id]);
        if (row && row.length >0 ) {
            return true ;
        }
        return false ;
    }
    catch(err){
        console.log(err);
        throw err ;
    }
}



exports.listing_type = ()=>{
 return db.execute('SELECT * FROM listing_types');
}