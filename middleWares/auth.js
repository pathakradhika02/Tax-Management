const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const authentication = async function (req, res, next) {
    try {
        let token = req.headers["authorization"]
        token = token && token.split(" ")[1] 
        if (!token) return res.send({ status: false, message: "authentication token must be present in headers" });
            
        let decodedtoken = jwt.verify(token, "cidbewiucwbvpeww98uweoichedochew9dhecuphdc9uwhe", { ignoreExpiration: true })
            
        let time = Math.floor(Date.now() / 1000)
        if (decodedtoken.exp < time) {
            return res.status(401).send({ status: false, message: "token expired, please login again" });
        }

        req.userId = decodedtoken.userId;

        next();
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}



const authorization = async function (req, res, next) {
    try {

        const userId = req.params.accountantId
        if (Object.keys(userId) == 0) return res.status(400).send({ status: false, message: "Please enter userId in path param....." })

        //  Check: logined User Exist 
        const isUserExist = await userModel.findOne({_id: userId, isDeleted: false})
        if(!isUserExist) return res.status(404).send({status: false, message: "User Not Found"})

        // CHECK : authorization
        if (req.userId != userId) return res.status(403).send({ status: false, message: "You haven't right to perform this task" })

        next();
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.authentication = authentication
module.exports.authorization = authorization