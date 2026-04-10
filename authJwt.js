require('dotenv').config();
const { json } = require('body-parser');
const { expressjwt: expressJwt } = require('express-jwt');

const secret = process.env.JWT_SECRET;

/* =========================
   1. AUTH MIDDLEWARE
   ========================= */
const authJwt = expressJwt({
    secret,
    algorithms: ['HS256'],
    requestProperty: 'user' // 👈 مهم جدًا: يخلي الداتا في req.user,
}).unless({
    path: [
        // public routes
        { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
        { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
        '/api/v1/user/login',
        '/api/v1/user/signup'
    ]
});


/* =========================
   2. CHECK ADMIN ONLY
   ========================= */
// const isAdmin = (req, res, next) => {
//     if (!req.user || req.user.isAdmin !== true) {
//         return res.status(403).json({
//             message: 'Access denied: Admin only'
//         });
//     }
//     next();
// };


/* =========================
    3. ROLE-BASED ACCESS (optional أقوى)
   ========================= */
const restrictTo = () => {
    return (req, res, next) => {
        if (!req.user || req.user.isAdmin !== true) {
            return res.status(403).json({
                message: 'Access denied: Admin only'
            });
        }
        next();
    };
};

/* =========================
    EXPORT
    ========================= */
module.exports = {authJwt , restrictTo};



