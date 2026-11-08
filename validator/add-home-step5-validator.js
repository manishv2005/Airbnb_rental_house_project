exports.validate_step5_data = (req,res,next) => {
    const data = req.body ;
    const errors = [] ;
    
   if (typeof data.houseName !== 'string' || data.houseName =="" ) {
    errors.push(" houseName is required")
   }
   if (typeof data.description !== 'string' || data.description =="" ) {
    errors.push("description is required")
   }
   if (!data.rules ||typeof data.rules !== 'object') {
    errors.push("rules is required")
   }
   else {
    if ( !Array.isArray(data.rules.selectedCommonRules)) {
        errors.push("commonRules is required")
    }
    else{
      const validCommonRules = data.rules.selectedCommonRules.every((ruleid) => {
        return typeof ruleid === 'number' && ruleid > 0
      });
      if(!validCommonRules){
        errors.push("commonRules is invalid") ;
      }
      if(data.rules.customRules){
        if(!Array.isArray(data.rules.customRules)){
          errors.push("customRules is required") ;
        }
        else {
          const vaildCustomRules = data.rules.customRules.every((rule) => {
            return typeof rule === "string" && rule.trim().length > 0 && rule.length <= 100 ;
          })
          if (!vaildCustomRules) {
            errors.push("customRules is invalid") ; 
          }
        }
      }
    }
   }


   if (errors && errors.length >0) {
    return res.status(422).json({message : errors})
   }
   next() ;

}
    