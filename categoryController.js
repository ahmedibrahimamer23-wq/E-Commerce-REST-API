const CategoryModel = require('./../Model/categoryModel');

exports.getCategory = async (req,res)=>{
    try{
        const getAcategory = await CategoryModel.find();

        if(!getAcategory){
            return res.status(404).json({
                status:'fail',
                message:'Not Found A Category'
            });
        }

        res.status(200).json({
            status:'success',
            data:getAcategory
        });

    }catch(error){
        res.status(400).json({status:'fail',success:false});
    }
};

exports.getOneCategory = async (req,res)=>{
    try{
        const getOnecat = await CategoryModel.findById(req.params.id);

        if(!getOnecat){
            return res.status(404).json({
                status:'fail',
                message:'Not Found A Category'
            });
        }

        res.status(200).json({
            status:'success',
            data: getOnecat
        });

    }catch(error){
        res.status(400).json({status:'fail',success:false});
    }
};

exports.CreateCategory = async(req,res)=>{
    try{

        const createCategory = await CategoryModel.create({
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color
        });

        res.status(201).json({
            status:'success',
            data: createCategory
        });

    }catch(error){
        res.status(500).json({
            status:'fail',
            error: error.message
        });
    }
};

exports.ubdateCategory = async(req,res)=>{

    try{

        const updateOne = await CategoryModel.findByIdAndUpdate(
            req.params.id,
            {
                name:req.body.name,
                icon:req.body.icon,
                color:req.body.color
            },
            { new: true }
        );

        if(!updateOne){
            return res.status(404).json({
                status:'fail',
                message:'Category is Not Found'
            });
        }

        res.status(200).json({
            status:'success',
            message: updateOne
        });

    }catch(error){
        res.status(400).json({status:'fail',message: "invaild id"});
    }
};