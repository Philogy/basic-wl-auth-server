const request = require('request')

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET

const verifyCaptcha = (captcha, remoteAddress) => {
  return new Promise((resolve) => {
    const captchaVerifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${captcha}&remoteip=${remoteAddress}`
    request(captchaVerifyURL, (err, response, body) => {
      body = JSON.parse(body)
      resolve(body.success)
    })
  })
}

module.exports = verifyCaptcha
