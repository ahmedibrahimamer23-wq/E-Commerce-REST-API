const nodemailer = require('nodemailer');
const sendEmail= async(options)=>{
    try{
        const transporter = await nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        secure:false,
        auth:{
            user:process.env.EMAIL_USER,
            pass: process.env.USER_PASSWORD
        }
    })
    await transporter.sendMail({
        from: `"EgyCompany" <${process.env.EMAIL_USER}>`,
        to:options.email,
        subject:options.subject,
        text:options.message
    });
    }catch(error){
        
    }
};

module.exports = sendEmail;