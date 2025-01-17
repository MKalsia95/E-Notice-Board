const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Notice = require('./models/notices');

const app= express();

//connect to mongoDB
const dbURI = 'mongodb+srv://admin:mansi9@enoticeboard.emwy1.mongodb.net/eNoticeBoard?retryWrites=true&w=majority&appName=eNoticeBoard';

mongoose
    .connect(dbURI)
    .then(()=> app.listen(3000))
    .catch((err)=>console.log(err));

//register view engine
app.set('view engine','ejs');    

//middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({extended : true})); 
app.use(morgan('dev')); 

app.get('/', (req, res) => {
    Promise.all([
        // Notice.find().sort({ createdAt : -1}), //Fetch all notices
        Notice.countDocuments(), //count total notices
        Notice.countDocuments({ type : 'urgent'}) //count urgent notices
    ])
        .then(([totalNotices,urgentNotices]) =>{
        res.render('admin',{ title: 'Admin Dashboard',totalNotices,urgentNotices});
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/manageNotices', (req,res)=>{
    Notice.find().sort({ createdAt : -1})
        .then((notices) =>{
            res.render('manageNotices', { title:"Manage notices", notices});
        })
        .catch((err)=>{
            console.log(err);
        });

});

app.get('/addnotices',(req,res)=>{
    res.render('addnotice',{title:"New Notice"});
});

app.post('/notices' , (req,res)=>{
    const notice = new Notice(req.body); //whatever we submit it will store in req.body in object form

    notice.save()
        .then((result) =>{
            res.redirect('/');
        })
        .catch((err)=>{
            console.log(err);
        });
});

app.get('/notices/addnotice',(req,res)=>{
    res.render('addnotice',{ title: 'addNotice'});
});

//to print all notices
app.get('/notices',(req,res)=>{
    Notice.find().sort({ createdAt: -1 })
        .then((result)=>{
            res.render('admin',{title:"All Notices", notices: result });
        })
        .catch((err)=>{
            console.log(err);
        });
});

//for editing notice
app.get('/notices/edit/:id', (req,res,next)=>{
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).send('Invalid Id format');
    }
    next();
},(req,res)=>{
    const id = req.params.id;
    Notice.findById(id)
        .then((notice)=>{
            res.render('editNotice',{ title: 'Edit Notice', notice});
        })
        .catch((err)=>{
            console.log(err);
        });
});

//to store the updated data
app.post('/notices/update/:id([0-9a-fA-F]{24})' , (req,res)=>{
    const id = req.params.id;
    Notice.findByIdAndUpdate(id, req.body , { new : true})
        .then(()=>{
            res.redirect('/manageNotices');
        })
        .catch((err)=>{
            console.log(err);
        });
});

app.delete('/notices/:id', (req,res)=>{
    const id= req.params.id;
    Notice.findByIdAndDelete(id)
        .then(result =>{
            res.json({ redirect: '/notices'})
        })
        .catch(err => console.log(err));
})
