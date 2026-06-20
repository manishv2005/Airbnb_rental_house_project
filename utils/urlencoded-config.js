
exports.urlencode_Config = {
    extended:true , // we can make nested object
    limit :'50kb' ,
    parameterLimit:200 ,
    inflate: true ,
    type : 'application/x-www-form-urlencoded' ,
    verify: (req , res , buf , encoding) => {
        if(buf && buf.length > 0) {
            req.rawBody = buf.toString(encoding || 'utf8') ;
        }
    }  
}
     






