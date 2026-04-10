const userModel = require('../Model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/SendEmail');
// 🔐 create token
const createToken = (id,isAdmin) => {
    return jwt.sign(
        { id: id, isAdmin},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};

// ✅ create user
exports.createUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.passwordHash, 12);

        const newUser = await userModel.create({
            name: req.body.name,
            email: req.body.email,
            passwordHash: hashedPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin || false,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        });

        res.status(201).json({
            status: 'success',
            data: newUser
        });

    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// ✅ get user by id
exports.getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: user
        });

    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// ✅ get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await userModel.find();

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: users
        });

    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// ✅ login
exports.login = async (req, res) => {
    try {
        const { email, passwordHash } = req.body;

        const user = await userModel
            .findOne({ email })
            .select('+passwordHash');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        const isMatch = await user.comparePasswordInDataBase(passwordHash);

        if (!isMatch) {
            return res.status(400).json({
                status: 'fail',
                message: 'Incorrect password'
            });
        }

        const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXPIRES_IN
    }
);

        res.status(200).json({
            status: 'success',
            token,
            data: user
        });

    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// ✅ signup
exports.signup = async (req, res) => {
    try {
        const { email, passwordHash } = req.body;

        if (!email || !passwordHash) {
            return res.status(400).json({
                status: 'fail',
                message: 'email and password are required'
            });
        }

        const hashedPassword = await bcrypt.hash(passwordHash, 12);

        const newUser = await userModel.create({
            ...req.body,
            passwordHash: hashedPassword
        });

        // const token = jwt.sign({id:newUser._id , role: user.isAdmin},process.env.JWT_SECRET,{
        //     expiresIn:process.env.JWT_EXPIRES_IN
        // });
        const token = createToken(newUser._id,newUser.isAdmin);

        res.status(201).json({
            status: 'success',
            token,
            data: newUser
        });

    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};
exports.forgotPassword = async(req,res)=>{
    try{
        const user = await userModel.findOne({email:req.body.email});
        if (!user){
            return res.status(404).json({status:'fail'})
        }
        //Create reset token 
        const resetToken  = user.createRandomResetToken();
        await user.save({validateBeforeSave: false});

        //Create url reset password
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

        const message = `We have receive a reset password request.
        Please use the link below  to reset your password ${resetUrl} this link will be expiers after 10 min`;
        
        await sendEmail({
            email:user.email,
            subject: 'Please reset your password',
            message
        });

        res.status(200).json({
            status: 'sucess',
            message: 'Reset token sent to email!'
        });

    }catch(error){
        if(user){
        user.passwordResetExpires= undefined;
        user.passwordResetToken = undefined;
        await user.save({validateBeforeSave: false});
        }
    res.status(500).json({status:'fail',message:'something went Wrong!'});
    };
};
exports.resetPassword = async(req,res,next)=>{
    try{
        const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await userModel.findOne({passwordResetToken: token , passwordResetExpires:{$gt:Date.now()}});
    if(!user){
        return res.status(400).json({message:'token is invalid'})
    }
    user.password = req.body.passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const createNewToken = createToken(user._id);

    res.status(200).json({status:'sucess',
        createNewToken,
        message:'Successfully reset password'
    });
    }catch(error){
        res.status(400).json({ message: error.message });
    };
} 