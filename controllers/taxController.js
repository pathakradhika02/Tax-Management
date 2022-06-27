const taxModel = require("../models/taxModel");
const userModel = require("../models/userModel");

// function to calculate tax on income
const cantralTax = function(income) {
    let tax = 0;

    if(income<=250000 ) {
        tax = 0;
    }
    if(income>250000 && income<=500000) {
        tax = (income * 5) / 100; 
    }
    if(income>500001 && income<=750000) {
        tax = (income * 10) / 100; 
    }
    if(income>750001 && income<=1000000) {
        tax = (income * 15) / 100; 
    }
    if(income>1000000 && income<=1250000) {
        tax = (income * 20) / 100; 
    }
    if(income>1250000 && income<=1500000) {
        tax = (income * 25) / 100; 
    }
    if(income>1500001) {
        tax = (income * 30) / 100; 
    }
    return tax;
}



//  Register Tax for Tax-Payer
const taxOfUser = async (req, res) => {
    try {
        const taxPayerId = req.params.taxPayerId;

        //  CHECK : Tax-Payer Exist 
        const taxPayer = await userModel.findOne({_id: taxPayerId, isDeleted: false})
        if(!taxPayer) return res.status(404).send({status: false, message: "Tax-Payer Doesn't Exist"});

        //  CHECK : tax-payer Deatils Alreay Exist
        const taxDetailsExistOrNot = await taxModel.findOne({userId: taxPayerId, isDeleted: false})

        if(taxDetailsExistOrNot) {
            if(taxPayer.taxType == "individual") {
                const income = taxPayer.income
                const tax = cantralTax(income)
    
                taxDataOfPayer = {
                    userId : taxPayerId,
                    CGST : tax,
                    SGST : 0,
                    toatalDueTax : tax,
                    status : "New"
                }
                const taxDetails = await taxModel.findOneAndUpdate({userId: taxPayerId}, taxDataOfPayer, {new: true})
                return res.status(200).send({status: true, message:"Tax Details", data: taxDetails})
            }
    
            if(taxPayer.taxType == "corporation") {
                const income = taxPayer.income
                //  Assuming state and central board taking 6% as tax 
                const cgst = (income*6)/100;
                const sgst = (income*6)/100;
            
                taxDataOfPayer = {
                    userId : taxPayerId,
                    CGST : cgst,
                    SGST : sgst,
                    toatalDueTax : cgst + sgst,
                    status : "New"
                }
                const taxDetails = await taxModel.findOneAndUpdate({userId: taxPayerId}, taxDataOfPayer, {new: true})
                return res.status(200).send({status: true, message:"Tax Details", data: taxDetails})
            }
        }
        //  Create Details if details doesn't Exist
        if(taxPayer.taxType == "individual") {
            const income = taxPayer.income
            const tax = cantralTax(income)

            taxDataOfPayer = {
                userId : taxPayerId,
                CGST : tax,
                SGST : 0,
                toatalDueTax : tax
            }
            const taxDetails = await taxModel.create(taxDataOfPayer)
            return res.status(201).send({status: true, message:"Tax Details", data: taxDetails})
        }
        if(taxPayer.taxType == "corporation") {
            const income = taxPayer.income

            const cgst = (income*6)/100;
            const sgst = (income*6)/100;
            //  Assuming state and central board taking 6% as tax 
            taxDataOfPayer = {
                userId : taxPayerId,
                CGST : cgst,
                SGST : sgst,
                toatalDueTax : cgst + sgst 
            }
            const taxDetails = await taxModel.create(taxDataOfPayer)
            return res.status(201).send({status: true, message:"Tax Details", data: taxDetails})
        }
    }
    catch(error) {
        console.log(error)
        res.status(500).send({status: false, message: error.message})
    }
}


//  Mark tax as paid
const markTaxPaid = async (req, res) => {
    try{
        const taxPayerId = req.params.taxPayerId

        // Check : user Exist 
        const userExist = await userModel.findOne({_id:taxPayerId, isDeleted: false})

        if(!userExist) return res.status(404).send({status: false, message:"User Not Found"})

        // CHECK : user is tax payer
        if(userExist.role != "tax-payer") return res.status(400).send({status: false, message: "You haven't Right To Perform The Task"})

        //  Check : tax details define for the user or not 
        const taxDetailsExist = await taxModel.findOne({userId: taxPayerId, isDeleted: false})
        if(!taxDetailsExist) return res.status(404).send({status: false, message: "Tax Deatils Not Found For The User"})
        //  Mark Tax as Done
        const updatedUser = await taxModel.findOneAndUpdate({userId: taxPayerId}, {toatalDueTax:0, status: "Paid"}, {new: true})

        res.status(200).send({status: true, message: "Tax Paid SuccessFully",data: updatedUser})

    }
    catch(error) {
        console.log(error)
        res.status(500).send({status: false, message: error.message})
    }
}


//  Manage tax due
const manageTaxDue = async (req, res) => {
    try{
        const accountantId = req.params.accountantId
        const taxPayerId = req.params.taxPayerId

        // Check : accountant Exist 
        const accountantExist = await userModel.findOne({_id:accountantId, isDeleted: false})
        if(!accountantExist) return res.status(404).send({status: false, message:"Accountant Not Found"})

        // Check : tax-payer Exist 
        const userExist = await userModel.findOne({_id:taxPayerId, isDeleted: false})
        if(!userExist) return res.status(404).send({status: false, message:"Tax-Payer Not Found"})

        // CHECK : the user with accountantId is tax-accountant or not
        if(accountantExist.role != "tax-accountant") return res.status(400).send({status: false, message: "You haven't Right To Perform The Task"})

        //  Check : tax details define for the user or not 
        const taxDetailsExist = await taxModel.findOne({userId: taxPayerId, isDeleted: false})
        if(!taxDetailsExist) return res.status(404).send({status: false, message: "Tax Deatils Not Found For The User"})

        // Check : tax is already paid
        if(userExist.status == "Paid") return res.status(400).send({status: false, message: "Can't Upadte Tax Status, Already Paid"})

        const status = req.body.status

        //  Check : if input is Paid
        if(status == "Paid") return res.status(400).send({status: false, message: "Can't Mark Status As Paid"})

        //  Mark Tax as Done
        const updatedUser = await taxModel.findOneAndUpdate({userId: taxPayerId}, { status: status}, {new: true})

        res.status(200).send({status: true, message: "Tax Status Updated SuccessFully",data: updatedUser})

    }
    catch(error) {
        console.log(error)
        res.status(500).send({status: false, message: error.message})
    }
}


//  View Tax Details 
const viewTaxDetails = async (req, res) => {
    try{
        const userId = req.params.userId

        // Check : user Exist 
        const userExistOrNot = await userModel.findOne({_id:userId, isDeleted: false})
        if(!userExistOrNot) return res.status(404).send({status: false, message:"User Not Found"})

        // Check : Role of User 
        if(userExistOrNot.role == "tax-payer") {
            const userTaxDeatils = await taxModel.findOne({userId: userId, isDeleted: false})
            return res.status(200).send({status: true, message: "Tax Details Of The User",data: userTaxDeatils})
        }
        else {
            // finding id's of Tax-payer
            let userIds = await userModel.find({role: "tax-payer", isDeleted: false}).select({_id:1})

            //  Find tax details of user
            const userTaxDeatils = []
            for(let i=0 ; i<userIds.length ; i++) {
                const userTax = await taxModel.findOne({userId: userIds[i]._id, isDeleted: false})
                if(userTax != null) userTaxDeatils.push(userTax)
            }
            return res.status(200).send({status: true, message: "Tax Details Of The User", data: userTaxDeatils})
        }
    }
    catch(error) {
        console.log(error)
        res.status(500).send({status: false, message: error.message})
    }
}


//  Create a tax due
const createTaxDue = async (req, res) => {
    try{
        const accountantId = req.params.accountantId
        const taxPayerId = req.params.taxPayerId

        // Check : accountant Exist 
        const accountantExist = await userModel.findOne({_id:accountantId, isDeleted: false})
        if(!accountantExist) return res.status(404).send({status: false, message:"Accountant Not Found"})

        // Check : tax-payer Exist 
        const userExist = await userModel.findOne({_id:taxPayerId, isDeleted: false})
        if(!userExist) return res.status(404).send({status: false, message:"Tax-Payer Not Found"})

        // CHECK : the user with accountantId is tax-accountant or not
        if(accountantExist.role == "tax-payer") return res.status(403).send({status: false, message: "You haven't Right To Perform The Task"})

        //  Check : tax details define for the user or not 
        const taxDetailsExist = await taxModel.findOne({userId: taxPayerId, isDeleted: false})
        if(!taxDetailsExist) return res.status(404).send({status: false, message: "Tax Deatils Not Found For The User"})

        // Check : tax is already paid
        if(userExist.status == "Paid") return res.status(400).send({status: false, message: "Can't Upadte Tax Status, Already Paid"})

        const currYear = new Date().getFullYear();
        let dueDate = `${currYear}-03-31`
        dueDate = new Date (dueDate)
        dueDate = dueDate.getTime()

        let currDate = new Date();
        currDate = currDate.getTime()

        if(dueDate>currDate) return res.status(400).send({status: false, message: "Tax Is Not Delyed"})

        //  Mark Tax as Done
        const updatedUser = await taxModel.findOneAndUpdate({userId: taxPayerId}, { status: 'Delayed'}, {new: true})

        res.status(200).send({status: true, message: "Tax Status Updated SuccessFully",data: updatedUser})

    }
    catch(error) {
        console.log(error)
        res.status(500).send({status: false, message: error.message})
    }
}





module.exports.taxOfUser = taxOfUser
module.exports.markTaxPaid = markTaxPaid
module.exports.manageTaxDue = manageTaxDue
module.exports.viewTaxDetails = viewTaxDetails
module.exports.createTaxDue = createTaxDue