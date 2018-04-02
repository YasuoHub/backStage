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
    res.redirect('/');
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
        res.redirect('/');
    }
});
app.get('/borrowCheck.html',function (req,res) {
    console.log('取得的cookie:'+req.cookies)
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    if(req.session.stuName){
        var user={name:req.session.stuName};
        var borrowChecks=[];
        dao.queryByTerm(['isPass','loanStatus','returnStatus','delateStatus'],['1','0','0','1'],'userdetails',function (err,result) {
            borrowChecks=result;
            dao.finish();
            res.render('borrowCheck',{user:user,borrowChecks:borrowChecks});
        });
    }else {
        res.redirect('/');
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
        dao.queryByTerm(['loanStatus','returnApplyStatus'],['1','1'],'userdetails',function (err,result) {
            returninfos=result;
            dao.finish();
            res.render('return',{user:user,returninfos:returninfos});
        });
    }else {
        res.redirect('/');
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
        res.redirect('/');
    }
});
app.get('/suggestReply.html',function (req,res) {
    console.log('我是suggestReply.html')
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    if(req.session.stuName){
        var user={name:req.session.stuName};
        var suggestinfos=[];
        dao.queryByTerm(['readStatus'],['1'],'suggest',function (err,result) {
            suggestinfos=result;
            dao.finish();
            res.render('suggestReply',{user:user,suggestinfos:suggestinfos});
        });
    }else {
        res.redirect('/');
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
        res.redirect('/');
    }
});
app.post('/getEquipOne',urlencodedParser,function (req,res) {
    var dao = new UserDao();
    dao.init();
    dao.queryByTerm(['equipNo'], [req.body.inputNo], 'equipmentone', function (err, data) {
        res.json({euipOne:data});
    })
})
app.get('/classUpdate.html',function (req,res) {
    var dao = new UserDao();
    dao.init();
    if(req.session.stuName){
        var user={name:req.session.stuName,date:new Date().toLocaleDateString()};
        dao.query('equipmentall',function (err,data) {
            res.render('classUpdate',{user:user,equipAll:data});
        })
    }else {
        res.redirect('/');
    }
});
app.get('/service.html',function (req,res) {
    if(req.session.stuName){
        var user={name:req.session.stuName};
        res.render('service',{user:user});
    }else {
        res.redirect('/');
    }
});
app.get('/board.html',function (req,res) {
    if(req.session.stuName){
        var user={name:req.session.stuName};
        res.render('board',{user:user});
    }else {
        res.redirect('/');
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
        res.redirect('/');
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
    var failReason=null;
    var whereArr = ['uDid'];
    var cluarr = ['loanStatus', 'readSatus', 'changeSatus','failReason', 'delateStatus'];
    var equipNo='';
    var equipAllNo='';
    var stuID='';
    if (req.body.delateStatus=='0') {
        delateStatus = req.body.delateStatus;
    }
    console.log("getEquipDate:"+getEquipDate);
    //成功领取设备
    if(loanStatus=='1'){
        dao.queryByTerm(['uDid'],[udid],'userdetails',function (err, result) {
            //初始化数据查询对象
            var dao1 = new UserDao();
            //2，数据初始化，连接数据库
            dao1.init();
            stuID=result[0].userID;
            equipNo=result[0].equipID;
            equipAllNo=result[0].equipID.replace(/[^a-z]+/ig,"").toUpperCase();
            dao1.updateRate(['canBorrow'],['0'],['equipID'],[result.equipID],function () {
                console.log("成功更改Borrow信息");
            })
            dao1.queryByTerm(['equipAllNo'],[equipAllNo],'equipmentall',function (err,data) {
                dao1.updateRate(['equipOverplus','equipLoan'],[data[0].equipOverplus-1,data[0].equipLoan+1],['equipAllNo'],[equipAllNo],'equipmentall',function () {
                    console.log("成功借出设备信息");
                    dao1.finish();
                }) ;
            });
        });
        var Paramsarr = [loanStatus, '1', '1',failReason,delateStatus];
        dao.updateRate(cluarr, Paramsarr, whereArr, udid, 'userdetails', function () {
            console.log("修改成功");
            dao.finish();
            return  res.send('1');
        });
    }else if(loanStatus=='0'){//未能领取设备
        if(req.body.failReason!='3'){//判断失败原因-系统原因
            failReason=req.body.failReason
            var Paramsarr = [loanStatus, '1', '1',failReason,delateStatus];
            dao.updateRate(cluarr, Paramsarr, whereArr, udid, 'userdetails', function () {
                console.log("修改成功");
                dao.finish();
                return  res.send('1');
            });
        }else{//判断失败原因-人为原因
            //扣掉信用分数
            var Paramsarr = [loanStatus, '1', '1',failReason,delateStatus];
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
    var equipNo='';
    var equipAllNo='';
    var stuID='';
    if(returnStatus=='0'){
        //扣掉信用分数
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
        dao.queryByTerm(['uDid'],[udid],'userdetails',function (err, result) {
            equipNo=result[0].equipID;
            equipAllNo=result[0].equipID.replace(/[^a-z]+/ig,"").toUpperCase();
            dao.queryByTerm(['equipAllNo'],[equipAllNo],'equipmentall',function (err,data) {
                dao.updateRate(['equipOverplus','equipLoan'],[data[0].equipOverplus+1,data[0].equipLoan-1],['equipAllNo'],[equipAllNo],'equipmentall',function () {
                    console.log("成功归还设备信息");
                }) ;
            });
            dao.updateRate(cluarr, Paramsarr, whereArr, udid, 'userdetails', function () {
                console.log("修改成功");
                dao.finish();
                return  res.send('1');
            });
        });
    }
});
//处理归还申请通过
app.post('/suggestReply',urlencodedParser,function (req,res) {
    //初始化数据查询对象
    var dao = new UserDao();
    //2，数据初始化，连接数据库
    dao.init();
    console.log("我是suggestReply");
    console.log(req.body);
    // //1,从body里面获得提交的数据
    var delateStatus = req.body.delateStatus;
    var nowstid = req.body.nowstid;
    var replyContent = null;
    var whereArr = ['stid'];
    var cluarr = ['readStatus', 'reply', 'delateStatus'];
    if (req.body.delateStatus=='1') {
        replyContent = req.body.replyContent;
    }
    var Paramsarr = ['0', replyContent, delateStatus];
    dao.updateRate(cluarr, Paramsarr, whereArr, nowstid, 'suggest', function () {
        console.log("修改成功");
        dao.finish();
        return  res.send('1');
    });
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
    var termArr=['delateStatus'];
    if (term=='searchStuId') {
        termArr.push('userID');
    }else if(term=='searchEquipNum'){
        termArr.push('equipID');
    }
    dao.queryByTerm(termArr,['1',termValue],'userdetails',function (err,result) {
        console.log("查询成功");
        dao.finish();
        return  res.send(result);
    })
});
//登录页面验证
app.post('/login',urlencodedParser,function (req,res) {
    console.log('我是login');
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
    dao.queryByTerm(termArr,termValueArr,'users',function (err,data) {
        dao.finish();
        if(data.length!=0){
            console.log(data[0]);
            req.session.stuRealID      =data[0].stuID;
            req.session.stuName        =data[0].stuName;
            req.session.passwd         =data[0].stuPassWord;
            if(data[0].stuPassWord!=passwd){
                return   res.end('3');//密码错误
            }
            if(remember){
                res.cookie('username', req.session.stuRealID, { expires: new Date(Date.now() + 30*24*60*60*1000), httpOnly: false });
                res.cookie('password', req.session.passwd, { expires: new Date(Date.now() + 30*24*60*60*1000), httpOnly: false });
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
    var  addEquipNum=0;
    var  termArr=['equipNo'];
    var  termValueArr=[equipNo];
    dao.queryByTerm(['equipAllNo'],[equipNo],'equipmentall',function (err,data) {
        if(data.length==0){
            return  res.end("-1");//表示该实验设备分类不存在
        }else{
            addEquipNum=parseInt(data[0].equipNumber)+parseInt(equipNum);
            console.log('addEquipNum:')
            console.log(data[0].equipNumber+equipNum);
            dao.updateRate(['equipNumber'],[addEquipNum],['equipAllNo'],[equipNo],'equipmentall',function () {
                console.log("成功添加"+equipNum +"件设备");
            }) ;
            dao.queryByTerm(termArr,termValueArr,'equipmentone',function (err,data) {
                console.log(data);
                //声明将要生成的实验设备编号
                var equipID='';
                //声明初始编号num
                var num=1;
                //声明要返回的数据字符串
                var returnStr='';
                //声明要插入数据的column
                var cluarr=['equipNo','equipName','equipID','equipDescription','equipCreator','equipModel','equipBuyDate','equipAddDate','addMan'];
                if(data.length!=0){
                    equipID=data[0].equipID;
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

var server = app.listen(8088)