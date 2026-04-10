const OrderItems = require('../Model/order-items');
exports.makeOrderItem = async(req,res)=>{
    try{
    const orderItemsM = await OrderItems.create(req.body);
    if(!orderItemsM){
        return res.status(400).json({message:'Bad process'});
    }
    res.status(201).json({status:'sucess',data:orderItemsM});
    }catch(error){
    res.status(500).json({message:error.message});
    }
}