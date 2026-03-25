const moment = require("moment");
const crypto = require("crypto");
const qs = require("qs");
require("dotenv").config();

// MOCK CONFIG
process.env.VNP_TMN_CODE = "FZIOHE8K";
process.env.VNP_HASH_SECRET = "M2I9D2W2L8M6S8I0X6A4C2E4M6F5F6V2"; // need real secret? We don't have it, we have to read .env
require('dotenv').config({ path: './.env' });

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

function validateReturn(vnp_Params) {
  const secretKey = process.env.VNP_HASH_SECRET;
  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  console.log("Calculated:", signed);
  console.log("Received:", secureHash);
  return secureHash === signed;
}

const urlParams = new URL(
  "http://localhost/api/v1/payments/vnpay_return?vnp_Amount=1000000000&vnp_BankCode=NCB&vnp_BankTranNo=VNP15465846&vnp_CardType=ATM&vnp_OrderInfo=Nap+tien+vao+vi+-+10.000.000+VND&vnp_PayDate=20260325004812&vnp_ResponseCode=00&vnp_TmnCode=FZIOHE8K&vnp_TransactionNo=15465846&vnp_TransactionStatus=00&vnp_TxnRef=DEPMN4WQZ2F&vnp_SecureHash=75cbfa8d74adf15b2928dd4fa622597490daf7c067739bdf6cc13ddfd1be04968cbfe2dc4e4e6b61a7ad8dfba8465b2c19605fd98bdce11c527c89c5d0fc4b08"
).searchParams;

const params = {};
for (const [key, value] of urlParams.entries()) {
  params[key] = value;
}

console.log("Params parsed:", params);
const isValid = validateReturn(params);
console.log("isValid:", isValid);
