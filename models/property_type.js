
const db = require('../utils/database')
exports.property_type_id_validation = async(type_id)=> {
    try {
    const [row] = await db.execute('SELECT type_id FROM property_types WHERE type_id = ?', [type_id]);
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



exports.get_property_types = () => {
        return db.execute('SELECT * FROM property_types');
}




