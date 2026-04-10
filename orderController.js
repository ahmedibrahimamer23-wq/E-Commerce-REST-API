
const Order = require('../Model/orderModel');
const orderItem = require('../Model/order-items');




exports.getorder = async(req,res)=>{
  try {
  const order = await Order.findById(req.params.id)
  .populate('user', 'name email')
  .populate({path: "orderItems", populate: {path: 'product', populate: "category"}})
  .sort({dateOrderd: -1});
  if(!order){
    return res.status(404).json({message: 'order Not Found!!'});
} 

res.status(200).json({status:'sucess', data: order}); 
} catch (error) {
  res.status(500).json({message: error.message});
};
};


exports.getOrders = async (req, res) => {
    try {
    const takeOrder = await Order.find()
        .populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            select: 'name price',
        },
        })
        .populate('user', 'name email')
        .sort({ dateOrderd: -1 });//from new to old..

    if (!takeOrder) {
        return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json({ status: 'success', data: takeOrder });
} catch (error) {
    res.status(500).json({ message: error.message });
}
};
exports.makeOrder = async (req, res) => {
  try {
    // 1. create orderItems + get IDs
    const orderItemsIds = await Promise.all(
      req.body.orderItems.map(async (item) => {
        const newOrderItem = await orderItem.create({
          quantity: item.quantity,
          product: item.product
        });

        return newOrderItem._id;
      })
    );

    // 2. calculate total price 🔥
    const totalPrices = await Promise.all(
      orderItemsIds.map(async (id) => {
        const item = await orderItem.findById(id).populate('product', 'price');
        return item.product.price * item.quantity;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    // 3. create order
    const newOrder = await Order.create({
      orderItems: orderItemsIds,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      Zip: req.body.Zip,
      Country: req.body.Country,
      phone: req.body.phone,
      status: req.body.status || 'pending',
      totalPrice,
      user: req.body.user
    });

    res.status(201).json({
      status: 'success',
      data: newOrder
    });

  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getSalesReport = async (req, res) => {
    try {
        const salesReport = await Order.aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: {
                        year:  { $year:  '$dateOrdered' },  // ✅ Bug 1 fixed: was '$dateOrderd'
                        month: { $month: '$dateOrdered' },  // ✅ Bug 1 fixed: was '$dateOrderd'
                    },
                    totalRevenue: { $sum: '$totalPrice' },  // ✅ Bug 2 fixed: was '$totalprice'
                    totalOrders:  { $count: {} },
                    averageOrder: { $avg: '$totalPrice' },
                    maxOrder:     { $max: '$totalPrice' },
                    minOrder:     { $min: '$totalPrice' },
                }
            },
            {
                $project: {
                    _id:          0,
                    year:         '$_id.year',
                    month:        '$_id.month',
                    totalRevenue: { $round: ['$totalRevenue', 2] }, // ✅ Bug 3 fixed: was 'totalRevenue'
                    totalOrders:  1,
                    averageOrder: { $round: ['$averageOrder', 2] },
                    maxOrder:     '$maxOrder',  // ✅ Bug 4 fixed: was just 1
                    minOrder:     '$minOrder',  // ✅ Bug 4 fixed: was just 1
                }
            }
        ]);

        res.status(200).json({ data: salesReport });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.UpdateStatus = async(req,res)=>{
  const updateStatusOrder = await Order.findByIdAndUpdate(req.params.id, 
    {status: req.body.status}, 
    {new : true});
    if(!updateStatusOrder){
    return res.status(400).json({message: 'Can Not be Created!!'});
    }
    res.status(201).json({data: updateStatusOrder});
};

exports.DeleteOrder = async(req,res)=>{
try {
  const removeIngOrder = await Order.findByIdAndDelete(req.params.id);
  if(!removeIngOrder){
    return res.status(400).json({status: false});
  }
  res.status(200).json({status:'sucess', data:null});
  
} catch (error) {
  res.status(500).json({message: error.message});
}
}