const db = require("../utils/database");

exports.common_rules = class Common_Rules {
    constructor (rule) {
        this.rule = rule;
    }

    saveRule() {
        return db.execute("INSERT INTO common_rules (rule) VALUES (?)", [this.rule]);
    }


    static get_all_rules () {
        return db.execute("SELECT * FROM common_rules ");
    }

    static update_rule (rule_id , rule) {
        return db.execute("UPDATE common_rules SET rule = ? WHERE rule_id = ?", [rule, rule_id]);
    }

    static delete_rule (rule_id) {
        return db.execute("DELETE FROM common_rules WHERE rule_id = ?", [rule_id]);
    }

    static get_rule (rule_id){
        return db.execute("SELECT * FROM common_rules WHERE rule_id = ?", [rule_id]);
    }



}