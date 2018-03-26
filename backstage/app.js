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
//首页进来就是借用申请页面
app.get('/borrow.html',function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    if(req.session.stuName){
        var user={name:req.session.stuName};
        var borrows=[];
        dao.queryByTerm(['examineStatus'],['1'],'userdetails',function (err,result) {
            borrows=result;
            dao.finish();
            res.render('borrow',{user:user,borrows:borrows});
        });
    }else {
        res.render('login',{});
    }
});
app.get('/borrowCheck.html',function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    if(req.session.stuName){
        var user={name:req.session.stuName};
        var borrowChecks=[];
        dao.queryByTerm(['isPass','loanStatus'],['1','0'],'userdetails',function (err,result) {
            borrowChecks=result;
            dao.finish();
            res.render('borrowCheck',{user:user,borrowChecks:borrowChecks});
        });
    }else {
        res.render('login',{});
    }
});
app.get('/return.html',function (req,res) {
    console.log('我是return.html')
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    if(req.session.stuName){
        var user={name:req.session.stuName};
        var returninfos=[];
        dao.queryByTerm(['loanStatus'],['1'],'userdetails',function (err,result) {
            returninfos=result;
            dao.finish();
            res.render('return',{user:user,returninfos:returninfos});
        });
    }else {
        res.render('login',{});
    }
});
app.get('/returnApply.html',function (req,res) {
    console.log('我是returnApply.html')
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    if(req.session.stuName){
        var user={name:req.session.stuName};
        var returninfos=[];
        dao.queryByTerm(['returnExamineStatus','delateStatus'],['1','1'],'userdetails',function (err,result) {
            returninfos=result;
            dao.finish();
            res.render('returnApply',{user:user,returninfos:returninfos});
        });
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
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    if(req.session.stuName){
        var user={name:req.session.stuName};
        var rates=[];
        dao.query("rate",function (err,result) {
            rates=result;
            dao.finish();
            res.render('rate',{user:user,rates:rates});
        });
    }else {
        res.render('login',{});
    }
});
/////////////////////////////////业务处理
//处理借用申请通过
app.post('/changeBorrowApply',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    console.log("我是changeBorrowApply");
    console.log(req.body);
    // //1,从body里面获得提交的数据
    var isPass = req.body.isPass;
    var udid = req.body.udid;
    var failReason = null;
    var getEquipDate = null;
    var whereArr = ['uDid'];
    var cluarr = ['isPass', 'failReason', 'examineStatus', 'readSatus', 'changeSatus','getEquipDate'];
    if (req.body.failReason) {
        failReason = req.body.failReason;
    }
    if(req.body.getEquipTime){
        getEquipDate=decodeURI(req.body.getEquipTime);
    }
    console.log("getEquipDate:"+getEquipDate);
    var Paramsarr = [isPass, failReason, '0', '1', '1',getEquipDate];
    dao.updateRate(cluarr, Paramsarr, whereArr, udid, 'userdetails', function () {
        console.log("修改成功");
        dao.finish();
        return  res.send('1');
    });
});
//设备领取
app.post('/ifGetEquip',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    console.log("我是ifGetEquip");
    console.log(req.body);
    // //1,从body里面获得提交的数据
    var loanStatus = req.body.loanStatus;
    var udid = req.body.udid;
    var delateStatus = 1;
    var getEquipDate = null;
    var whereArr = ['uDid'];
    var cluarr = ['loanStatus', 'readSatus', 'changeSatus', 'delateStatus'];
    if (req.body.delateStatus=='0') {
        delateStatus = req.body.delateStatus;
    }
    console.log("getEquipDate:"+getEquipDate);
    if(loanStatus=='1'){
        var Paramsarr = [loanStatus, '1', '1',delateStatus];
        dao.updateRate(cluarr, Paramsarr, whereArr, udid, 'userdetails', function () {
            console.log("修改成功");
            dao.finish();
            return  res.send('1');
        });
    }else if(loanStatus=='0'){
        if(req.body.failReason!='3'){
            var Paramsarr = [loanStatus, '1', '1',delateStatus];
            dao.updateRate(cluarr, Paramsarr, whereArr, udid, 'userdetails', function () {
                console.log("修改成功");
                dao.finish();
                return  res.send('1');
            });
        }else{
            //扣掉信用分数
            var Paramsarr = [loanStatus, '1', '1',delateStatus];
            var stuID='';
            dao.queryByTerm(['uDid'],[udid],'userdetails',function (err, result) {
                stuID=result[0].userID;
                dao.queryByTerm(['stuID'],[stuID],'users',function (err,result) {
                    var creditDegree=result[0].creditDegree-30;
                    dao.updateRate(['creditDegree'], [creditDegree], ['stuID'],[stuID],'users', function () {
                        console.log("修改成功");
                        dao.updateRate(cluarr, Paramsarr, whereArr, udid, 'userdetails', function () {
                            console.log("修改成功");
                            dao.finish();
                            return  res.send('1');
                        });
                    });
                })
            });
        }
    }
});
//处理归还申请通过
app.post('/changeReturnApply',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    console.log("我是changeReturnApply");
    console.log(req.body);
    // //1,从body里面获得提交的数据
    var returnApplyStatus = req.body.returnApplyStatus;
    var udid = req.body.udid;
    var failReason = null;
    var whereArr = ['uDid'];
    var cluarr = ['returnApplyStatus', 'returnApplyFailReason', 'returnExamineStatus', 'readSatus', 'changeSatus'];
    if (req.body.returnApplyStatus=='0') {
        failReason = req.body.failReason;
    }
    var Paramsarr = [returnApplyStatus, failReason, '0', '1', '1'];
    dao.updateRate(cluarr, Paramsarr, whereArr, udid, 'userdetails', function () {
        console.log("修改成功");
        dao.finish();
        return  res.send('1');
    });
});
//处理设备归还
app.post('/changeReturn',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    console.log("我是changeReturn");
    console.log(req.body);
    // //1,从body里面获得提交的数据
    var returnStatus = req.body.returnStatus;
    var udid = req.body.udid;
    var whereArr = ['uDid'];
    if(returnStatus=='0'){
        //扣掉信用分数
        var stuID='';
        dao.queryByTerm(['uDid'],[udid],'userdetails',function (err, result) {
            stuID=result[0].userID;
            dao.queryByTerm(['stuID'],[stuID],'users',function (err,result) {
                var creditDegree=result[0].creditDegree-30;
                dao.updateRate(['creditDegree'], [creditDegree], ['stuID'],[stuID],'users', function () {
                    console.log("修改成功");
                        dao.finish();
                        return  res.send('1');
                });
            })
        });
    }else{
        var cluarr = ['returnStatus', 'loanStatus', 'readSatus', 'changeSatus'];
        var Paramsarr = [returnStatus, '0', '1', '1'];
        dao.updateRate(cluarr, Paramsarr, whereArr, udid, 'userdetails', function () {
            console.log("修改成功");
            dao.finish();
            return  res.send('1');
        });
    }
});
//处理历史记录查询
app.post('/getHistory',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    console.log("我是getHistory");
    console.log(req.body);
    // //1,从body里面获得提交的数据
    var term = req.body.term;
    var termValue = req.body.termValue;
    var termArr=[];
    if (term=='searchStuId') {
        termArr.push('userID');
    }else if(term=='searchEquipNum'){
        termArr.push('equipID');
    }
    dao.queryByTerm(termArr,[termValue],'userdetails',function (err,result) {
        console.log("查询成功");
        dao.finish();
        return  res.send(result);
    })
});
//登录页面验证
app.post('/login',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    // res.render('login',{});
    var username= req.body.username;
    var passwd  = req.body.password;
    var remember = req.body.remember;
    var termArr=['stuID'];
    var termValueArr=[username];
    console.log(req.body);
    req.session.username=username;
    dao.queryByTerm(termArr,termValueArr,'users',function (err,data) {
        dao.finish();
        if(data.length!=0){
            console.log(data[0]);
            req.session.stuName         =data[0].stuName;
            if(data[0].stuPassWord!=passwd){
                return   res.end('3');//密码错误
            }
            if(remember){
                // req.cookies("user",{"username":username,"passwd":passwd});
            }
            console.log(req.session);
            if(data[0].power=='1'){
                return   res.end('1');//权限为管理员
            }else if( data[0].power=='0') {
                return   res.end('-1');//没有权限
            }
        }else{
            return  res.end('2');//账号错误
        }

    });

});
//保存实验设备种类更新信息
app.post('/saveClassUpdate',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
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
        dao.finish();
        return  res.end('1');
    }) ;
});
//保存实验设备更新信息
app.post('/saveUpdate',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
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
            return  res.end("-1");//表示该实验设备分类不存在
        }else{
            dao.queryByTerm(termArr,termValueArr,'equipmentone',function (err,data) {
                //声明将要生成的实验设备编号
                var equipID='';
                //声明初始编号num
                var num=1;
                //声明要返回的数据字符串
                var returnStr='';
                //声明要插入数据的column
                var cluarr=['equipNo','equipName','equipID','equipDescription','equipCreator','equipModel','equipBuyDate','equipAddDate','addMan'];
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
                        dao.finish();
                        return   res.end(returnStr);
                    }
                })(equipNum);
            });
        }
    });
});
//保存公告发布模块信息
app.post('/saveBoard',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    //1,从body里面获得提交的数据
    var  title= req.body.title;
    var  content= req.body.content;
    var  addMan= req.session.stuName;
    var  addDate= new Date().toLocaleDateString();
    //执行插入
    var cluarr=['title','content','addMan','addDate'];
    var Paramsarr=[title,content,addMan,addDate];
    dao.insert(cluarr,Paramsarr,'board',function () {
        dao.finish();
        return   res.end('1');
    }) ;
    });
//保存报修信息
app.post('/saveService',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
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
        dao.finish();
        return  res.end('1');
    }) ;
});
//保存值日表信息
app.post('/saveRate',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    console.log("我是SAVERATE");
    //1,从body里面获得提交的数据
    var  stuIdArr= req.body['stuIdArr[]'];
    var  stuNameArr= req.body['stuNameArr[]'];
    var  stuPhoneArr= req.body['stuPhoneArr[]'];
    var  cluarr=['rateMan','rateManName','rateManPhone','rateTime','changeDate'];
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
            dao.finish();
           return res.end('1');
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
                dao.finish();
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