const userModel = require("../models/userModel");
const validInput = require("../validators/validInput");

const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")


//  register User 
const register = async (req, res) => {
    try{
        const reqBody = req.body

        //  CHECK : if request body is empty
        if (!Object.keys(reqBody).length > 0) return res.status(400).send({ status: false, error: "Please enter data" })

        let { phone, email, password} = reqBody

        //  CHECK : if any data field is empty
        if (!validInput.isEmpty(reqBody.name)) return res.status(400).send({ status: false, message: 'please provide name'})
        if (!validInput.isEmpty(reqBody.phone)) return res.status(400).send({ status: false, message: 'please provide phone'})
        if (!validInput.isEmpty(reqBody.email)) return res.status(400).send({ status: false, message: 'please provide email'})
        if (!validInput.isEmpty(reqBody.password)) return res.status(400).send({ status: false, message: 'please provide password'})
        if (!validInput.isEmpty(reqBody.address)) return res.status(400).send({ status: false, message: 'please provide address' })
        if (!validInput.isEmpty(reqBody.address.state)) return res.status(400).send({ status: false, message: 'please provide address state'})
        if (!validInput.isEmpty(reqBody.address.city)) return res.status(400).send({ status: false, message: 'please provide address city'})
        if (!validInput.isEmpty(reqBody.address.pincode)) return res.status(400).send({ status: false, message: 'please provide address pincode'})
        if (!validInput.isEmpty(reqBody.income)) return res.status(400).send({ status: false, message: 'please provide Income'})
    
        //  Check : Inputs in Valid Formate
        if (!validInput.isValidEmail(reqBody.email)) return res.status(400).send({ status: false, message: 'please provide valid email'})
        if (!validInput.isValidPhone(reqBody.phone)) return res.status(400).send({ status: false, message: 'please provide valid phone'})
        if (!validInput.isValidPincode(reqBody.address.pincode)) return res.status(400).send({ status: false, message: 'please provide valid pincode'})
        if (!validInput.isValidPassword(reqBody.password)) return res.status(400).send({ status: false, message: 'please provide valid password(minLength=8 , maxLength=16)' })
        
        // role of user
        if(reqBody.role != null) {
            if (!validInput.isEmpty(reqBody.role)) return res.status(400).send({ status: false, message: 'please provide role'})
            if (!validInput.isValidRole(reqBody.role)) return res.status(400).send({ status: false, message: 'please provide valid role (tax-accountant,tax-payer or admin)'})
        }

        //  Tex-type of user 
        if(reqBody.taxType != null) {
            if (!validInput.isEmpty(reqBody.taxType)) return res.status(400).send({ status: false, message: 'please provide taxType'})
            if (!validInput.isValidTaxType(reqBody.taxType)) return res.status(400).send({ status: false, message: 'please provide valid role (individual or corporation)'})
        }

        //  CHECK : if any data field fails unique validation
        const isPhoneAlreadyUsed = await userModel.findOne({ phone })
        if (isPhoneAlreadyUsed) return res.status(400).send({ status: false, message: "This mobile is number already in use,please provide another mobile number" })

        const isEmailAlreadyUsed = await userModel.findOne({ email })
        if (isEmailAlreadyUsed) return res.status(400).send({ status: false, message: "This  is email already in use,please provide another email" })

        // ENCRYPTING PASSWORD
        let saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);
        let hash = await bcrypt.hash(password, salt);

        password = hash


        //  CREATE :  user
        const user = {
            name: reqBody.name,
            email: email,
            role: reqBody.role,
            phone: phone,
            income: reqBody.income,
            password: password,
            taxType: reqBody.taxType,
            address: {
                state: reqBody.address.state,
                city: reqBody.address.city,
                pincode: reqBody.address.pincode
            }
        }
        const createdUser = await userModel.create(user)
        return res.status(201).send({ status: true, message: "User created successfully", data: createdUser })
    }
    catch(error) {
        console.log(error)
        res.status(500).send({status: false , message: error.message});
    }
}


//  List tax Payers
const listTaxPayers = async (req, res) => {
    try{
        const accountantId = req.params.accountantId;

        //  Check : logined user should be admin or accountant
        const isUserCanList = await userModel.findOne({_id: accountantId, role : {$in: ["tax-accountant", "admin"]}, isDeleted: false})
        if(!isUserCanList) return res.status(403).send({status: false, message: "You Haven't Right To List Down The Tax-Payers"});

        const taxPayers = await userModel.find({role : "tax-payer", isDeleted: false});

        return res.status(200).send({status: true, message: "List Of Tax-Payers", data: taxPayers});

    }
    catch(error) {
        console.log(error);
        res.status(500).send({status: false, message:error.message});
    }
}


//  Update Tax Payers
const updateTaxPayers = async (req, res) => {
    try{
        const accountantId = req.params.accountantId;
        const taxPayerId = req.params.taxPayerId

        const reqBody = req.body;

        //  Check : logined user should be admin or accountant
        const isUserCanList = await userModel.findOne({_id: accountantId, role : {$in: ["tax-accountant", "admin"]}, isDeleted: false})
        if(!isUserCanList) return res.status(403).send({status: false, message: "You Haven't Right To Update Tax-Payers"});

        const upadtes = {}

        if(reqBody.name != null) {
            // if Empty
            if (!validInput.isEmpty(reqBody.name)) return res.status(400).send({ status: false, message: 'please provide name'})
            upadtes['name'] = reqBody.name
        }
        if(reqBody.phone != null) {
            // empty
            if (!validInput.isEmpty(reqBody.phone)) return res.status(400).send({ status: false, message: 'please provide phone'})
            // Invalid phone
            if (!validInput.isValidPhone(reqBody.phone)) return res.status(400).send({ status: false, message: 'please provide valid phone'})
            // Duplicate Phone
            const isPhoneAlreadyUsed = await userModel.findOne({ phone })
            if (isPhoneAlreadyUsed) return res.status(400).send({ status: false, message: "This mobile is number already in use,please provide another mobile number" })
            upadtes['phone'] = reqBody.phone
        }
        if(reqBody.email != null) {
            // empty
            if (!validInput.isEmpty(reqBody.email)) return res.status(400).send({ status: false, message: 'please provide email'})
            // Invalid email
            if (!validInput.isValidEmail(reqBody.email)) return res.status(400).send({ status: false, message: 'please provide valid email'})
            // Duplicate email
            const isEmailAlreadyUsed = await userModel.findOne({ email })
            if (isEmailAlreadyUsed) return res.status(400).send({ status: false, message: "This  is email already in use,please provide another email" })
            upadtes['email'] = reqBody.email
        }
        if(reqBody.role != null) {
            if (!validInput.isEmpty(reqBody.role)) return res.status(400).send({ status: false, message: 'please provide role'})
            if (!validInput.isValidRole(reqBody.role)) return res.status(400).send({ status: false, message: 'please provide valid role (tax-accountant,tax-payer or admin)'})
            upadtes['role'] = reqBody.role
        }
        if(reqBody.income != null) {
            if (!validInput.isEmpty(reqBody.income)) return res.status(400).send({ status: false, message: 'please provide Income'})
            upadtes['income'] = reqBody.income
        }
        if(reqBody.taxType != null) {
            if (!validInput.isEmpty(reqBody.taxType)) return res.status(400).send({ status: false, message: 'please provide taxType'})
            if (!validInput.isValidTaxType(reqBody.taxType)) return res.status(400).send({ status: false, message: 'please provide valid role (individual or corporation)'})
            upadtes['taxType'] = reqBody.taxType
        }
        if(reqBody.address != null) {
            if (!validInput.isEmpty(reqBody.address)) return res.status(400).send({ status: false, message: 'please provide address' })
            if (!validInput.isEmpty(reqBody.address.state)) return res.status(400).send({ status: false, message: 'please provide address state'})
            if (!validInput.isEmpty(reqBody.address.city)) return res.status(400).send({ status: false, message: 'please provide address city'})
            if (!validInput.isEmpty(reqBody.address.pincode)) return res.status(400).send({ status: false, message: 'please provide address pincode'})
            if (!validInput.isValidPincode(reqBody.address.pincode)) return res.status(400).send({ status: false, message: 'please provide valid pincode'})
            upadtes['address']['state'] = reqBody.address.state
            upadtes['address']['city'] = reqBody.address.city
            upadtes['address']['pincode'] = reqBody.address.pincode
        }

        const updatedTaxPayer = await userModel.findOneAndUpdate({_id: taxPayerId}, upadtes, {new: true});
        return res.status(200).send({status: true, message: "Updated Tax-Payer", data: updatedTaxPayer});

    }
    catch(error) {
        console.log(error);
        res.status(500).send({status: false, message:error.message});
    }
}


//  LogIn
const loginUser = async (req, res) => {
    try{
        const email = req.body.email
        const password = req.body.password

        //  Check : logined user should be admin or accountant
        const isUserExist = await userModel.findOne({email: email, isDeleted: false})
        if(!isUserExist) return res.status(404).send({status: false, message: "User Not Found"});

        // DECRYPTING PASSWORD
        let validPassword = await bcrypt.compare(password, isUserExist.password);
        if (!validPassword) return res.status(400).send({ status: false, message: "Wrong password ,please enter correct password..." });

        //  GENERATE : token  
        const token = jwt.sign({
            userId: isUserExist._id.toString(),
            role: isUserExist.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 30 * 60
        }, "cidbewiucwbvpeww98uweoichedochew9dhecuphdc9uwhe");
        
        res.setHeader("Authorization", token);

        return res.status(200).send({ status: true, message: "User login successfull", data: { usreId: isUserExist._id, token: token } });

    }
    catch(error) {
        console.log(error);
        res.status(500).send({status: false, message:error.message});
    }
}




module.exports.register = register
module.exports.listTaxPayers = listTaxPayers
module.exports.updateTaxPayers = updateTaxPayers
module.exports.loginUser = loginUser