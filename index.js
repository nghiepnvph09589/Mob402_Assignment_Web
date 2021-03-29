let express = require('express');
let hbs = require('express-handlebars');
let multer = require('multer');

let mongoose = require('mongoose');
var url = 'mongodb+srv://nghiep123:a123456@cluster0.7adir.mongodb.net/Nodejs?retryWrites=true&w=majority';

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(function (conn) {
        console.log('Connected')
    })

let userSchema = require('./model/userSchema');
let productsSchema = require('./model/productsSchema');
let adminSchema = require('./model/adminSchema');
let billSchema = require('./model/billSchema');
let User = mongoose.model('user', userSchema, 'User')
let Product = mongoose.model('product', productsSchema, 'Products');
let Admin = mongoose.model('admin', adminSchema, 'Admin');
let Bill = mongoose.model('bill', billSchema, 'Bill');


let app = express();

///
app.use(express.static('css'));
app.use(express.static('fonts'));
app.use(express.static('vendor'));
app.use(express.static('public'));

///


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/public', express.static(__dirname + "public"));


//thiet lap hanlde bars
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: '',
    layoutsDir: ''

}));
app.set('view engine', '.hbs');
app.listen(9994);


app.get('/', function (request, res) {
    res.render('Login')
});
app.get('/addUser', function (request, res) {
    res.render('index')
});


app.post('/login', async function (request, res) {
    let admin = await Admin.find({}).lean();
    var user1 = request.body.name;
    var pass1 = request.body.pass;

    for (var i = 0; i < admin.length; i++) {

        if (admin[i].User == user1 && admin[i].Pass == pass1) {
            console.log("name : " + admin[i].User);
            console.log("pass : " + admin[i].Pass);
            let products = await Product.find({}).lean();
            res.render('getAllPro', {arr: products})
            return ;
        }
    }
    res.render('Login', {isShow:true,alertMessage:'Đăng nhập thất bại'})
    //res.redirect('/')
});


app.post('/add', async (req, res) => {
    var name1 = req.body.name;
    var user1 = req.body.user;
    var pass1 = req.body.pass;
    var phone1 = req.body.phone;
    var adress1 = req.body.adress;
    const user = new User({
        Name: name1,
        User: user1,
        Pass: pass1,
        Phone: phone1,
        Adress: adress1
    });
    try {
        await user.save();
        let users = await User.find({}).lean();

        res.render('getAll', {arr: users})
    } catch (e) {
        res.redirect('Login' + e.message)
    }

});


app.post('/delete', async (req, res) => {
    //let id = '5e9d5cc5cf2d181bb47b71ef';
    var id = (req.body.id);
    //var name = parseInt(req.body.name);
    console.log(id)
    try {
        await User.findByIdAndDelete(id)
        res.send('delete thanh cong')
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
})

app.get('/getAll', async (req, res) => {
    let users = await User.find({}).lean();

    try {
        //res.send(user)

        res.render('getAll', {arr: users})
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
});
//user

app.get('/deleteUser/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id + '');
    console.log('id:' + req.params.id);
    res.redirect('/getAll')
});
app.get('/editUser/:id', async (req, res) => {
    let user = await User.find({}).lean();
    console.log('id:' + req.params.id);

    for (var i = 0; i < user.length; i++) {
        console.log("id user : " + user[i]._id);
        if (user[i]._id == req.params.id) {
            res.render('updateUser', {
                id: user[i]._id,
                name: user[i].Name,
                user: user[i].User,
                pass: user[i].Pass,
                phone: user[i].Phone,
                adress: user[i].Adress
            })
            return;
        }
    }

});

app.post('/editUser/updateUser', async (req, res) => {
    //et id = '5e9d5cc5cf2d181bb47b71ef';
    var id1 = req.body.id;
    var name1 = req.body.name;
    var user1 = req.body.user;
    var pass1 = req.body.pass;
    var phone1 = req.body.phone;
    var adress1 = req.body.adress;
    console.log('update id: ' + id1);
    console.log('update name1: ' + name1);
    console.log('update user1: ' + user1);
    console.log('update pass1: ' + pass1);
    console.log('update adress1:' + adress1);
    try {
        await User.findByIdAndUpdate(id1, {
            Name: name1,
            User: user1,
            Pass: pass1,
            Phone: phone1,
            Adress: adress1

        })
        res.redirect('/getAll')
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
});


//san pham
app.get('/getAllPro', async (req, res) => {
    let products = await Product.find({}).lean();
    try {
        //res.send(user)

        res.render('getAllPro', {arr: products})
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
});

app.get('/deleteProduct/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id + '');
    console.log('id:' + req.params.id);
    res.redirect('/getAllPro')
})

app.get('/addProduct', async (req, res) => {
    console.log('id:' + req.params.id);
    res.render('addProduct');
})

let multerConfig = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, './public')
    },
    filename: function (request, file, cb) {

        //let math = ["image/png", "image/jpeg", "image/gif"];
        let math = ["image/jpeg"];
        if (math.indexOf(file.mimetype) === -1) {
            let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpg.`;
            return cb(errorMess, null);
        }
        cb(null, file.fieldname + '_' + file.originalname + '_' + Date.now() + '.JPEG')
    }

});
let uploadManyFiles = multer({
    storage: multerConfig, limits: {
        fileSize: 1 * 1024 * 1024,
        files: 2,

    }
}).single("avatar");


app.post('/addProduct2', async (req, res) => {

    uploadManyFiles(req, res, async function () {
        var name1 = req.body.name;
        var type1 = req.body.type;
        var price1 = req.body.price;
        console.log('name1: ' + name1);
        console.log('file: ' + req.file.path);

        var image = req.file.path.split('\\')[1];

        const product = new Product({
            Name: name1,
            Type: type1,
            Price: price1,
            Img: image

        });
        await product.save(function (err, product) {
            if (err) {
                res.render('addProduct', {error: err})
            } else {
                res.redirect('/getAllPro')
            }
        })
    })
});


app.get('/editProduct/:id', async (req, res) => {
    let product = await Product.find({}).lean();
    console.log('id:' + req.params.id);

    for (var i = 0; i < product.length; i++) {
        console.log("id product : " + product[i]._id);
        if (product[i]._id == req.params.id) {
            res.render('updateProduct', {
                id: product[i]._id,
                name: product[i].Name,
                type: product[i].Type,
                price: product[i].Price,

                type2: product[i].Type
            });
            console.log('editProduct/:id:' + product[i].Type);
            return;
        }
    }
});

app.post('/editProduct/updateProduct', async (req, res) => {

    uploadManyFiles(req, res, async function () {

        var id1 = req.body.id;
        var name1 = req.body.name;
        var type1 = req.body.type;
        var price1 = req.body.price;
        console.log('name1: ' + name1);
        console.log('file: ' + req.file.path);
        console.log('price: ' + price1);
        console.log('type: ' + type1);

        var image = req.file.path.split('\\')[1];

        try {
            await Product.findByIdAndUpdate(id1, {
                Name: name1,
                Type: type1,
                Price: price1,
                Img: image

            });
            res.redirect('/getAllPro')
        } catch (e) {
            res.send('co loi xay ra: ' + e.message)
        }

    })
});


//search
app.post('/searchUser', async (req, res) => {
    let nameUser = req.body.searchUser;
    let user = await User.find({}).lean();
    let arrUser = [];
    for (var i = 0; i < user.length; i++) {
        console.log("id user : " + user[i]._id);
        if ((user[i].User).toLowerCase().indexOf(nameUser.toLowerCase())>-1) {
            arrUser.push(user[i]);

        }
    }
    res.render('getAll', {arr: arrUser});

});

app.post('/editUser/searchUser', async (req, res) => {
    let nameUser = req.body.searchUser;
    let user = await User.find({}).lean();
    let arrUser = [];
    for (var i = 0; i < user.length; i++) {
        console.log("id user : " + user[i]._id);
        if ((user[i].User).toLowerCase().indexOf(nameUser.toLowerCase())>-1) {
            arrUser.push(user[i]);

        }
    }
    res.render('getAll', {arr: arrUser});


});

app.post('/editBill/searchUser', async (req, res) => {
    let nameUser = req.body.searchUser;
    let user = await User.find({}).lean();
    let arrUser = [];
    for (var i = 0; i < user.length; i++) {
        console.log("id user : " + user[i]._id);
        if (user[i].User == nameUser) {
            arrUser.push(user[i]);
            res.render('getAll', {arr: arrUser});
            return;
        }
    }
    res.render('getAll')

});

app.post('/editAdmin/searchUser', async (req, res) => {
    let nameUser = req.body.searchUser;
    let user = await User.find({}).lean();
    let arrUser = [];
    for (var i = 0; i < user.length; i++) {
        console.log("id user : " + user[i]._id);
        if (user[i].User == nameUser) {
            arrUser.push(user[i]);
            res.render('getAll', {arr: arrUser});
            return;
        }
    }
    res.render('getAll')

});
//Search sản phẩm
//search
app.post('/searchPro', async (req, res) => {
    let namePro = req.body.searchUser;
    let pro = await Product.find({}).lean();
    let arr = [];
    for (var i = 0; i < pro.length; i++) {

        if ((pro[i].Name).toLowerCase().indexOf(namePro.toLowerCase())>-1) {
            console.log("id pro : " + pro[i]._id);
            arr.push(pro[i]);
        }
    }
    res.render('getAllPro', {arr: arr});
});

app.post('/editProduct/searchPro', async (req, res) => {
    let namePro = req.body.searchUser;
    let pro = await Product.find({}).lean();
    let arr = [];
    for (var i = 0; i < pro.length; i++) {

        if ((pro[i].Name).toLowerCase().indexOf(namePro.toLowerCase())>-1) {
            console.log("id pro : " + pro[i]._id);
            arr.push(pro[i]);
        }
    }
    res.render('getAllPro', {arr: arr});
});

app.post('/editAdmin/searchPro', async (req, res) => {
    let namePro = req.body.searchUser;
    let pro = await Product.find({}).lean();
    let arr = [];
    for (var i = 0; i < pro.length; i++) {

        if ((pro[i].Name).toLowerCase().indexOf(namePro.toLowerCase())>-1) {
            console.log("id pro : " + pro[i]._id);
            arr.push(pro[i]);
        }
    }
    res.render('getAllPro', {arr: arr});
});


////search bill
app.post('/searchBill', async (req, res) => {
    let nameBill = req.body.searchUser;
    let bill = await Bill.find({}).lean();
    let arr = [];
    let arrT = [];
    for (const item of bill) {
        let user = await User.findById(item.idUser).lean();
        let product = await Product.findById(item.idProducts).lean();
        //console.log('user: '+user)
        //console.log('product: '+product)

        arrT.push({
            _id: item._id.toString(),
            idUser: item.idUser,
            userName: user.Name,
            idproduct: item.idproduct,
            productname: product.Name,
            Amount: item.Amount,
            Total: item.Total,
            Img: product.Img,
        })
    }

    for (var i = 0; i < arrT.length; i++) {

        if ((arrT[i].productname).toLowerCase().indexOf(nameBill.toLowerCase())>-1) {
            console.log("id pro : " + arrT[i]._id);
            arr.push(arrT[i]);
        }
    }
    //console.log('ar: '+arr[0])
    res.render('getAllBill', {arr: arr})
});



app.post('/editBill/searchBill', async (req, res) => {
    let nameBill = req.body.searchUser;
    let bill = await Bill.find({}).lean();
    let arr = [];
    let arrT = [];
    for (const item of bill) {
        let user = await User.findById(item.idUser).lean();
        let product = await Product.findById(item.idProducts).lean();
        //console.log('user: '+user)
        //console.log('product: '+product)

        arrT.push({
            _id: item._id.toString(),
            idUser: item.idUser,
            userName: user.Name,
            idproduct: item.idproduct,
            productname: product.Name,
            Amount: item.Amount,
            Total: item.Total,
            Img: product.Img,
        })
    }

    for (var i = 0; i < arrT.length; i++) {

        if ((arrT[i].productname).toLowerCase().indexOf(nameBill.toLowerCase())>-1) {
            console.log("id pro : " + arrT[i]._id);
            arr.push(arrT[i]);
        }
    }
    //console.log('ar: '+arr[0])
    res.render('getAllBill', {arr: arr})
});

//
// let upload = multer({
//     storage: multerConfig, limits: {
//         fileSize: 2 * 1024 * 1024
//     }
// })
//
// let uploadManyFiles = upload.single('avatar');


app.post('/upload', function (req, res) {

    uploadManyFiles(req, res, function (error) {

        // thực hiện upload

        // Nếu upload thành công, không lỗi thì tất cả các file của bạn sẽ được lưu trong biến req.files

        if (error) {
            console.log('loi: ' + error);
            if (error.message == 'File too large') {
                return res.send(error.message + '. Only send up to 1 MB per files')
            } else if (error.message == "Too many files") {
                return res.send(error.message + '. Only send up to 3 files');
            } else {
                return res.send('Error when trying upload many files: ' + error);
            }
        }

        if (req.files + '' == '') {
            return res.send(`You must select at least 1 file or more.`);
        } // trả về cho người dùng cái thông báo
        return res.send(`Your files has been uploaded. `);

    })


});


/////////////////////////////////////////////////////////
app.post('/addBill', async (req, res) => {

    var tenKhachHang = req.body.tenKhachHang;
    var tenSanPham = req.body.tenSanPham.split('&')[0];
    var soLuong = req.body.soLuong;
    var tong = req.body.tong;

    const bill = new Bill({
        idUser: tenKhachHang,
        idProducts: tenSanPham,
        Amount: soLuong,
        Total: tong

    });
    await bill.save(function (err, product) {
        if (err) {
            res.render('addBill', {error: err})
        } else {
            res.redirect('/getAllBill')
        }
    })

});

//chon them bill
app.get('/addBill', async (req, res) => {
    let product = await Product.find({}).lean();
    let user = await User.find({}).lean();

    res.render('addBill', {sanPham: product, khachHang: user})

});

//lay danh sach bill
app.get('/getAllBill', async (req, res) => {
    let bill = await Bill.find({}).lean();


    let arr = [];
    for (const item of bill) {
        let user = await User.findById(item.idUser).lean();
        let product = await Product.findById(item.idProducts).lean();
        //console.log('user: '+user)
        //console.log('product: '+product)

        arr.push({
            _id: item._id.toString(),
            idUser: item.idUser,
            userName: user.Name,
            idproduct: item.idproduct,
            productname: product.Name,
            Amount: item.Amount,
            Total: item.Total,
            Img: product.Img,
        })
    }
    //console.log('ar: '+arr[0])

    res.render('getAllBill', {arr: arr})

});


//edit bill
app.get('/editBill/:id', async (req, res) => {
    let bill = await Bill.find({}).lean();

    let product = await Product.find({}).lean();
    let user = await User.find({}).lean();

    console.log('id bill:' + req.params.id);

    for (var i = 0; i < bill.length; i++) {
        console.log("id product : " + bill[i]._id);

        let userName;
        let productname;
        for (const item of bill) {
            let user = await User.findById(item.idUser).lean();
            let product = await Product.findById(item.idProducts).lean();
            //console.log('user: '+user)
            //console.log('product: '+product)
            userName = user.Name;
            productname = product.Name;

        }


        if (bill[i]._id == req.params.id) {
            res.render('updateBill', {
                sanPham: product,
                khachHang: user,
                userName: userName,
                productname: productname,
                Amount: bill[i].Amount,
                Total: bill[i].Total,
                id: req.params.id
            })
            return;
        }
    }

});

//xóa bill
app.get('/deleteBill/:id', async (req, res) => {

    await Bill.findByIdAndDelete(req.params.id + '');
    console.log('id:' + req.params.id);
    res.redirect('/getAllBill')


});
//sau khi edit thi update
app.post('/editBill/updateBill', async (req, res) => {

    var id1 = req.body.id;
    var tenKhachHang = req.body.tenKhachHang;
    var tenSanPham = req.body.tenSanPham.split('&')[0];
    var soLuong = req.body.soLuong;
    var tong = req.body.tong;

    try {
        await Bill.findByIdAndUpdate(id1, {
            idUser: tenKhachHang,
            idProducts: tenSanPham,
            Amount: soLuong,
            Total: tong

        });
        res.redirect('/getAllBill')
    } catch (e) {
        res.render('updateBill' + e.message)
    }

});


//admin
//add

app.post('/addAdmin2', async (req, res) => {
    var name1 = req.body.name;
    var user1 = req.body.user;
    var pass1 = req.body.pass;

    const admin = new Admin({
        Name: name1,
        User: user1,
        Pass: pass1,

    });
    await admin.save(function (err, product) {
        if (err) {
            res.render('addAdmin', {error: err})
        } else {
            res.redirect('/getAllAdmin')
        }
    })
});

app.get('/addAdmin', (req, res) => {
    res.render('addAdmin');
});

app.get('/getAllAdmin', async (req, res) => {
    let admin = await Admin.find({}).lean();

    try {
        //res.send(user)

        res.render('getAllAdmin', {arr: admin})
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
});
//user

app.get('/deleteAdmin/:id', async (req, res) => {
    await Admin.findByIdAndDelete(req.params.id + '');
    console.log('id:' + req.params.id);
    res.redirect('/getAllAdmin')
});
app.get('/editAdmin/:id', async (req, res) => {
    let admin = await Admin.find({}).lean();
    console.log('id:' + req.params.id);

    for (var i = 0; i < admin.length; i++) {
        console.log("id admin : " + admin[i]._id);
        if (admin[i]._id == req.params.id) {
            res.render('updateAdmin', {
                id: admin[i]._id,
                name: admin[i].Name,
                user: admin[i].User,
                pass: admin[i].Pass,
            })
            return;
        }
    }

});

app.post('/editAdmin/updateAdmin', async (req, res) => {
    //et id = '5e9d5cc5cf2d181bb47b71ef';
    var id1 = req.body.id;
    var name1 = req.body.name;
    var user1 = req.body.user;
    var pass1 = req.body.pass;

    console.log('update id: ' + id1);
    console.log('update name1: ' + name1);
    console.log('update user1: ' + user1);

    try {
        await Admin.findByIdAndUpdate(id1, {
            Name: name1,
            User: user1,
            Pass: pass1,


        })
        res.redirect('/getAllAdmin')
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
});


//////////////////////
//trả file json
app.get('/getJsonUser', async (req, res) => {
    let user = await User.find({}).lean();
    res.send(user)
});

///login app


//
app.get('/getJsonProducts', async (req, res) => {
    let products = await Product.find({}).lean();
    res.send(products)
});


/////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
/////////xử lí cho app///////////////////////////////////////////////////////////////////////////////////
//them người dùng
app.post('/addUserApp', async (req, res) => {
    console.log('them user app')
    var name1 = req.body.Name;
    var user1 = req.body.User;
    var pass1 = req.body.Pass;
    var phone1 = req.body.Phone;
    var adress1 = req.body.Adress;
    const user = new User({
        Name: name1,
        User: user1,
        Pass: pass1,
        Phone: phone1,
        Adress: adress1
    });
    try {
        await user.save();
        console.log(user)
    } catch (e) {
        console.log('them user that bai: ' + e.message);

    }

});

//them bill
app.post('/addBillApp', async (req, res) => {

    var tenKhachHang = req.body.idUser;
    var tenSanPham = req.body.idProducts;
    var soLuong = req.body.Amount;
    var tong = req.body.Total;

    const bill = new Bill({
        idUser: tenKhachHang,
        idProducts: tenSanPham,
        Amount: soLuong,
        Total: tong

    });
    await bill.save(function (err, product) {
        if (err) {
            console.log('Them that bai' + bill)
        } else {
            console.log('Them thanh cong' + bill)
        }
    })

});

////lay danh sach bill theo user
app.post('/getUserBillApp', async (req, res) => {
    let uId = req.body.uId;

    console.log('uId: ' + uId)
    let bill = await Bill.find({}).lean();
    let arr = [];
    for (const item of bill) {
        let user = await User.findById(item.idUser).lean();
        let product = await Product.findById(item.idProducts).lean();
        console.log('user: '+user)
        console.log('product: '+product)
        console.log('uId u: ' + user._id)
        if (user._id == uId) {


            arr.push({
                _id: item._id.toString(),
                idUser: item.idUser,
                userName: user.Name,
                idproduct: item.idProducts,
                productname: product.Name,
                Amount: item.Amount,
                Price: product.Price,
                Total: item.Total,
                Img: product.Img,

            })
            console.log('ar: '+item.idProducts)
        }
    }
    //console.log('ar: '+arr[0])
    res.send(arr)

});

//xóa bill app
//xóa bill
app.post('/deleteBillApp', async (req, res) => {

    await Bill.findByIdAndDelete(req.body.id + '');
    console.log('id:' + req.body.id);

});

//update bill
app.post('/editBillApp', async (req, res) => {
    var id1 = req.body.BId;
    var tenKhachHang = req.body.idUser;
    var tenSanPham = req.body.idProducts;
    var soLuong = req.body.Amount;
    var tong = req.body.Total;

    try {
        await Bill.findByIdAndUpdate(id1, {
            idUser: tenKhachHang,
            idProducts: tenSanPham,
            Amount: soLuong,
            Total: tong
        });
    } catch (e) {
        console.log('id:' + id1);
    }
});


///thong tin user
app.post('/detailUserApp', async function (request, res) {
    let user = await User.find({}).lean();
    var id = request.body.uId;
    console.log("id : " + id);
    let arr = [];
    for (var i = 0; i < user.length; i++) {

        if (user[i]._id == id) {
            arr.push(user[i]);
            console.log("user : " + user[i].Name);
            //return;
        }
    }

    res.send(arr)
});

/////update user
app.post('/updateUserApp', async (req, res) => {
    //et id = '5e9d5cc5cf2d181bb47b71ef';
    var id1 = req.body.Id;
    var name1 = req.body.Name;
    var user1 = req.body.User;
    var pass1 = req.body.Pass;
    var phone1 = req.body.Phone;
    var adress1 = req.body.Adress;

    try {
        await User.findByIdAndUpdate(id1, {
            Name: name1,
            User: user1,
            Pass: pass1,
            Phone: phone1,
            Adress: adress1
        })
        console.log('update thanh cong user: '+user1)
        console.log('update id: ' + id1);
        console.log('update name1: ' + name1);
        console.log('update pass1: ' + pass1);
        console.log('update sdt: ' + phone1);
        console.log('update adress1:' + adress1);
    } catch (e) {
        console.log('update that bai user: '+user1)
    }
});


///search san pham
app.post('/searchProductsApp', async (req, res) => {
    let Search = req.body.Search;
    let product = await Product.find({}).lean();
    let arr = [];
    if(Search==''){
        res.send(product);
        return ;
    }

    for (var i = 0; i < product.length; i++) {

        if ((product[i].Name).toLowerCase().indexOf(Search.toLowerCase())>-1) {
            arr.push(product[i]);
           // console.log("sap Search : " + product[i].Name);
        }else {
        //    console.log("search :"+Search.toLowerCase());
        //    console.log("pro :"+(product[i].Name).toLowerCase());
          //  console.log("search index:"+(product[i].Name).toLowerCase().indexOf(Search.toLowerCase()))
        }
    }
    res.send(arr);
    console.log(arr)
});






