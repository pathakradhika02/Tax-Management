const isEmpty = function (value) {
    if (typeof (value) === 'undefined' || typeof (value) === 'null') return false
    else if (typeof (value) === 'string' && value.trim().length > 0) return true
    else if (typeof (value) === 'object') return true
}


const isValidPhone = function (phone) {
    if (/^\+?([6-9]{1})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{5})$/.test(phone)) return true
}


const isValidEmail = function (email) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return true
}

const isValidPassword = function (password) {
    if (/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password)) return true
}

const isValidPincode = function (pincode) {
    if ( /^\+?([1-9]{1})\)?([0-9]{5})$/.test(pincode)) return true
}


const isValidRole = function (value) {
    let enumValue = ["tax-accountant", "tax-payer", "admin"]
    for (let i=0 ; i<enumValue.length ; i++) {
        if (value == enumValue[i])  return true
    }
    return false;
}


const isValidTaxType = function (value) {
    let enumValue = ["individual", "corporation"]
    for (let i=0 ; i<enumValue.length ; i++) {
        if (value == enumValue[i])  return true
    }
    return false;
}





module.exports.isEmpty = isEmpty
module.exports.isValidPhone = isValidPhone
module.exports.isValidEmail = isValidEmail
module.exports.isValidPassword = isValidPassword
module.exports.isValidPincode = isValidPincode
module.exports.isValidRole = isValidRole
module.exports.isValidTaxType = isValidTaxType