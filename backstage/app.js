//引入express模块
var express = require('express');
var UserDao = require('./dao/UserDao');
var session=require('express-session');
//获得express对象
var app = express();
//获得body-parser模块
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
//指定模板引擎
app.set("views engine", 'ejs');
//指定模板位置
app.set('views', __dirname + '/views');
//静态文件
app.use(express.static('public'));
//使用cookieParser
app.use(cookieParser());
//配置session
app.use(session({
    secret: 'a secret',   // 可以随便写。 一个 String 类型的字符串，作为服务器端生成 session 的签名
    name:'session_id',//保存在本地cookie的一个名字 默认connect.sid  可以不设置
    resave: false,   //强制保存 session 即使它并没有变化,。默认为 true。建议设置成 false
    saveUninitialized: true,   //强制将未初始化的 session 存储。 默认值是true  建议设置成true
    // cookie: {
    //     maxAge:50000 //过期时间
    //
    // },	//设置过期时间比如是30分钟，只要浏览页面，30分钟没有操作的话在过期
    rolling:true //在每次请求时强行设置 cookie，这将重置 cookie 过期时间(默认：false)
}));

//初始化数据查询对象
var dao = new UserDao();
//2，数据初始化，连接数据库
dao.init();
app.get('/',function (req,res) {
    res.render('login',{});
});
app.get('/index',function (req,res) {
    res.render('index',{});
});
//注销登录
app.get('/logout',function (req,res) {
    req.session.destroy();
    res.render('login',{});
});
//各页面跳转
app.get('/borrow.html',function (req,res) {
   if(req.session.stuName){
       var user={name:req.session.stuName};
       res.render('borrow',{user:user});
   }else {
       res.render('login',{});
   }
});
app.get('/return.html',function (req,res) {
    if(req.session.stuName){
        var user={name:req.session.stuName};
        res.render('return',{user:user});
    }else {
        res.render('login',{});
    }
});
app.get('/history.html',function (req,res) {
    if(req.session.stuName){
        var user={name:req.session.stuName};
        res.render('history',{user:user});
    }else {
        res.render('login',{});
    }
});
app.get('/update.html',function (req,res) {
    if(req.session.stuName){
        var user={name:req.session.stuName,date:new Date().toLocaleDateString()};
        res.render('update',{user:user});
    }else {
        res.render('login',{});
    }
});
app.get('/classUpdate.html',function (req,res) {
    if(req.session.stuName){
        var user={name:req.session.stuName,date:new Date().toLocaleDateString()};
        res.render('classUpdate',{user:user});
    }else {
        res.render('login',{});
    }
});
app.get('/service.html',function (req,res) {
    if(req.session.stuName){
        var user={name:req.session.stuName};
        res.render('service',{user:user});
    }else {
        res.render('login',{});
    }
});
app.get('/board.html',function (req,res) {
    if(req.session.stuName){
        var user={name:req.session.stuName};
        res.render('board',{user:user});
    }else {
        res.render('login',{});
    }
});
app.get('/rate.html',function (req,res) {
    if(req.session.stuName){
        var user={name:req.session.stuName};
        var rates=[];
        dao.query("rate",function (err,result) {
            rates=result;
            res.render('rate',{user:user,rates:rates});
        });
    }else {
        res.render('login',{});
    }
});
//登录进来首页
app.get('/manage',function (req,res) {
    var user={name:req.session.stuName};
    res.render('borrow',{user:user});
});
//登录页面验证
app.post('/login',urlencodedParser,function (req,res) {
    // res.render('login',{});
    var username= req.body.username;
    var passwd  = req.body.password;
    var remember = req.body.remember;
    var termArr=['stuID'];
    var termValueArr=[username];
    console.log(req.body);
    req.session.username=username;
    dao.queryByTerm(termArr,termValueArr,'users',function (err,data) {
        if(data.length!=0){
            console.log(data[0]);
            req.session.stuName         =data[0].stuName;
            if(data[0].stuPassWord!=passwd){
                 res.end('3');//密码错误
            }
            if(remember){
                // req.cookies("user",{"username":username,"passwd":passwd});
            }
            console.log(req.session);
            if(data[0].power=='1'){
                res.end('1');//权限为管理员
            }else if( data[0].power=='0') {
                res.end('-1');//没有权限
            }
        }else{
                res.end('2');//账号错误
        }

    });

});
//保存实验设备种类更新信息
app.post('/saveClassUpdate',urlencodedParser,function (req,res) {
    console.log("我是saveClassUpdate");
    console.log(req.body);
    //1,从body里面获得提交的数据
    var  equipName= req.body.equipName;
    var  equipAllNo= req.body.equipAllNo;
    var  equipImage= req.body.equipImage;
    var  addMan= req.session.stuName;
    var  equipAddDate= new Date().toLocaleDateString();
    //执行插入
    var cluarr=['equipName','equipAllNo','equipImage','addMan','equipAddDate'];
    var Paramsarr=[equipName,equipAllNo,equipImage,addMan,equipAddDate];
    dao.insert(cluarr,Paramsarr,'equipmentall',function () {
        res.end('1');
    }) ;
});
//保存实验设备更新信息
app.post('/saveUpdate',urlencodedParser,function (req,res) {
    console.log("我是saveUpdate");
    console.log(req.body);
    //1,从body里面获得提交的数据
    var  equipNo= req.body.equipNo;
    var  equipName= req.body.equipName;
    var  equipNum= req.body.equipNum;
    var  equipCreator= req.body.equipCreator;
    var  equipModel= req.body.equipModel;
    var  equipBuyDate= req.body.equipBuyDate;
    var  equipDescription= req.body.equipDescription;
    var  addMan= req.session.stuName;
    var  equipAddDate= new Date().toLocaleDateString();
    var  termArr=['equipNo'];
    var  termValueArr=[equipNo];
    dao.queryByTerm(['equipAllNo'],[equipNo],'equipmentall',function (err,data) {
        if(data.length==0){
            res.end("-1");//表示该实验设备分类不存在
        }else{
            dao.queryByTerm(termArr,termValueArr,'equipmentone',function (err,data) {
                //声明将要生成的实验设备编号
                var equipID='';
                //声明初始编号num
                var num=1;
                //声明要返回的数据字符串
                var returnStr='';
                //声明要插入数据的column
                var cluarr=['equipNo','equipName','equipID','equipDescription','equipModel','equipCreator','equipBuyDate','equipAddDate','addMan'];
                if(data.length!=0){
                    equipID=data[data.length-1].equipID;
                    num = parseInt(equipID.replace(/[^0-9]+/ig,""))+1;
                    equipID=equipNo+num;
                }else{
                    equipID=equipNo+num;
                }
                returnStr +=equipID;
                (function insertUpdate(flag) {
                    if(flag>0){
                        //变化equipID
                        equipID =equipNo+num;
                        num++;
                        //执行插入
                        var Paramsarr=[equipNo,equipName,equipID,equipDescription,equipCreator,equipModel,equipBuyDate,equipAddDate,addMan];
                        dao.insert(cluarr,Paramsarr,'equipmentone',function () {
                            console.log("成功添加第"+equipID+"号设备");
                        }) ;
                        --flag;
                        insertUpdate(flag);
                    }else{
                        if(equipNum!=1){
                            returnStr +='-'+equipID;
                        }
                        res.end(returnStr);
                    }
                })(equipNum);
            });
        }
    });
});
//保存公告发布模块信息
app.post('/saveBoard',urlencodedParser,function (req,res) {
    //1,从body里面获得提交的数据
    var  title= req.body.title;
    var  content= req.body.content;
    var  addMan= req.session.stuName;
    var  addDate= new Date().toLocaleDateString();
    //执行插入
    var cluarr=['title','content','addMan','addDate'];
    var Paramsarr=[title,content,addMan,addDate];
    dao.insert(cluarr,Paramsarr,'board',function () {
        res.end('1');
    }) ;
    });
//保存报修信息
app.post('/saveService',urlencodedParser,function (req,res) {
    console.log("我是saveService");
    console.log(req.body);
    //1,从body里面获得提交的数据
    var  equipID= req.body.equipID;
    var  damReason= req.body.damReason;
    var  damMan= req.body.damName;
    var  damManTel= req.body.damManTel;
    var  addMan= req.session.stuName;
    var  addDate= new Date().toLocaleDateString();
    //执行插入
    var cluarr=['equipID','damReason','damMan','damManTel','addMan','addDate'];
    var Paramsarr=[equipID,damReason,damMan,damManTel,addMan,addDate];
    dao.insert(cluarr,Paramsarr,'service',function () {
        res.end('1');
    }) ;
});
//保存值日表信息
app.post('/saveRate',urlencodedParser,function (req,res) {
    console.log("我是SAVERATE");
    //1,从body里面获得提交的数据
    var  stuIdArr= req.body['stuIdArr[]'];
    var  stuNameArr= req.body['stuNameArr[]'];
    var  stuPhoneArr= req.body['stuPhoneArr[]'];
    var cluarr=['rateMan','rateManName','rateManPhone','rateTime','changeData'];
    var  addDate= new Date().toLocaleDateString();
    var  flag=0;
    var  whereArr=['rid'];
    var  termArr=[];
    //执行插入
    console.log(req.body['stuIdArr[]']);
    console.log(req.body);
    (function insertRate(flag) {
        if(flag<stuIdArr.length){
            var Paramsarr=[stuIdArr[flag],stuNameArr[flag],stuPhoneArr[flag],++flag,addDate];
            dao.updateRate(cluarr,Paramsarr,whereArr,flag,'rate',function () {
                console.log("插入成功");
            }) ;
            insertRate(flag);
        }else {
            res.end('1');
        }
    })(flag);
});
app.post('/register',urlencodedParser,function (req,res) {
    //1,从body里面获得提交的数据
    var  email= req.body.email;
    var  name= req.body.name;
    var  passwd= req.body.passwd;

    //1,查询
    //1,创建对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    //3,查询语句
    dao.queryByName(name,function (data) {
        console.log(data);

        if(data.length==0){
            console.log("执行插入");
            //执行插入
            dao.insert(name,email,passwd,function () {
                res.render('index',{});
            });

        }else{
            //回到注册页面，进行提示
        }

    });


    console.log(email+":"+name+":"+passwd);

    //res.render('login',{});
});




var server = app.listen(8088)