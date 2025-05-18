const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const md5 = require("md5");
const Role = require("../../models/role.model");

//[GET] /admin/accounts
module.exports.index = async (req, res) => {

    let find = {
        deleted: false,
    };


    const records = await Account.find(find).select("-password -token");

    for(const record of records) {
        const role = await Role.findOne({
            _id: record.role_id,
            deleted: false,
        })
        record.role = role;
    }

    res.render("admin/pages/accounts/index", {
        pageTitle: "Danh sách tài khoản",
        records: records
    });
};

//[GET] /admin/accounts/create
module.exports.create = async (req, res) => {
    const roles = await Role.find({
        deleted: false,
    })

    res.render("admin/pages/accounts/create", {
        pageTitle: "Tạo tài khoản mới",
        roles: roles
    });
};

//[POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
    const emailExits = await Account.findOne({
        email: req.body.email,
        deleted: false
    })

    if(emailExits) {
        req.flash("error", `Email ${req.body.email} đã tồn tại`);
        res.redirect(req.get("referer"));
    } else {
        req.body.password = md5(req.body.password);

        const record = new Account(req.body);
        await record.save();

        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
};


