import nodemailer from 'nodemailer'

const isValidatePaylod = (body: any, fields: string[]): boolean => {
    if (!body) {
        return false
    }
    for (let i = 0; i < fields.length; i++) {
        if (!body[fields[i]]) return false
    }
    return true
}

const isValidDateFormat = (date: string) => {
    const splitedDate = date.split('-')
    if (splitedDate.length < 3) {
        return false
    }
    if (splitedDate[0].length < 4) {
        return false
    }
    const convert_month = Number(splitedDate[1])
    if (Number.isNaN(convert_month) || convert_month < 1 || convert_month > 12) {
        return false
    }
    const convert_date = Number(splitedDate[2])
    if (Number.isNaN(convert_date) || convert_date < 1 || convert_date > 31) {
        return false
    }
    return true
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kapilrohilla2002@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD!,
    },
})
const sendMail = (to: string, subject: string, body: string) => {
    transporter.sendMail({
        from: 'kapilrohilla2002@gmail.com',
        to: to,
        subject: subject,
        text: body,
    })
}

const helper = { isValidatePaylod, isValidDateFormat, sendMail }
export default helper
