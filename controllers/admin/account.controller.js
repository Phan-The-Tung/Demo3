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

//[GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    let find = {
        _id: req.params.id,
        deleted: false
    }
    try {
        const data = await Account.findOne(find);

        const roles = await Role.find({
            deleted: false,
        })
    
        res.render("admin/pages/accounts/edit", {
            pageTitle: "Chinhr sửa tài khoản",
            data: data,
            roles: roles
        });
        
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/accounts`); 
    }   
};


//[PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
     const id =req.params.id;

     const emailExits = await Account.findOne({
        _id: { $ne: id},
        email: req.body.email,
        deleted: false
    })

    if(emailExits) {
        req.flash("error", `Email ${req.body.email} đã tồn tại`);
    } else {
        if(req.body.password) {
            req.body.password = md5(req.body.password);
        } else {
            delete req.body.password;
        }

        await Account.updateOne({ _id: id}, req.body);
        req.flash("success", `Cập nhật tài khoản thành công`);
    }
    res.redirect(req.get("referer"));
};





