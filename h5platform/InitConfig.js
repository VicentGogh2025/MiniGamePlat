$(document).ready(function(){
    var isShow;
    var selectedLang;
    var initConfJOs;
   $.get("https://api.luckybooms.com/api/config/languages",function(data,status){
    if(data.code != 200){
      alert("加载语言项错误，请刷新重试");
      return;
    }
   // alert("数据: " + data.code + "\n状态: " + status);
   initConfJOs = data.data;
   var selectedPhoneCode;
   initConfJOs.forEach(element => {
      var langStr = element.languagecode;
      var opStr = "<option value='"+langStr+"'>"+langStr+"</option>";
     
      $("#lanSelect").append(opStr)
      
      var phoneCodeStr = element.phoneCode
     // var phoneCodeNum = phoneCodeStr.slice(1)
      var pcStr = "<option value='"+phoneCodeStr+"'>"+phoneCodeStr+"</option>";
      $("#select_phoneCode").append(pcStr)
     
      selectedPhoneCode = phoneCodeStr;
    

    });
    console.log("selectedPhoneCode==="+selectedPhoneCode)
    $("#select_phoneCode").val(selectedPhoneCode)
   });
   $("#lanSelect").on('change',function(){
      selectedLang = $(this).val();
      $("#LocationSelectorBtn").show();
      $("#lanSelect").hide();
      isShow = false;
    //  alert('选中的值是：' + selectedLang);
   });

    $("#LocationSelectorBtn").click(function(){
      if(isShow){
         $("#LocationSelectorBtn").show();
        $("#lanSelect").hide();
        isShow = false;
        
      }
      else{
         $("#LocationSelectorBtn").hide();
        $("#lanSelect").show();
        
        isShow = true;
      }
    });

    RegisterUser();
    LoginUser();
  })

  function EmailValidater(email){
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (emailPattern.test(email)) {
       return true;
    } else {
       return false;
    }
  }

  function isAccountFormatValid(account,spanid) {
    console.log("isAccountFormatValid=="+account.length)
    if(account.length == 0){
        $(spanid).html("请输入用户名");
        console.log("===请输入用户名")
        return false;
    }
    if (account.length < 6) {
        $(spanid).html("用户名长度不能少于6个字符");
        console.log("account===length"+"用户名长度不能少于6个字符")
        return false;
    
    } else if (!/^[a-zA-Z0-9]+$/.test(account)) {
        $(spanid).html("用户名只能包含字母和数字");
        console.log("account===length"+"用户名只能包含字母和数字")
        return false;
    }
    $(spanid).html("");
    return true; // 如果用户名有效
}

  function isChinaName(name) {
    var pattern = /^[\u4E00-\u9FA5]{1,6}$/;
    return pattern.test(name);
}
  function userName(inputid,spanid) {
    var userName = $.trim($(inputid).val())

    var res = isAccountFormatValid(userName,spanid)

    return res;
    // $(inputid).focus(function() {
    //     $(spanid).html("");
    // });

};

function isPhoneNo(phone) {
    var pattern = /^1[34578]\d{9}$/;
    return pattern.test(phone);
}


function userTel(inputid, spanid) {
    var ut = $.trim($(inputid).val())
    console.log("userTel==="+ut);
        if(ut.length == 0) {
            $(spanid).html("× 手机号没有输入");
            return false
        } else {
            if (isPhoneNo(ut) == false) {
                $(spanid).html("× 手机号码不正确");
                return false
            }
        }

        $(spanid).html("");
        return true;

};

function LoginUser(){
    $("#LoginBtn").click(function(){
        var formData = new FormData();
       
        var vPwd = $("#input_pwd").val();
        var vEmail = $("#input_email").val();
       // var vNickname = $("#input_account").val();
      //  var res = userName("#input_account","#tip_span")

        if(vPwd.length==0){
            console.log("error===input_pwd===")
            return
        }
        res = EmailValidater(vEmail)
        if(!res){
        // $("#vEmail").attr('placeholder',"邮箱不符合规格")
         $("#tip_span").html("邮箱不符合规格");
         console.log("error===input_email===")
         return
        }
        formData.append('username',vEmail)
        formData.append('password',vPwd)
        console.log("====email==="+vEmail);
        console.log("====pwd==="+vPwd);
        $.ajax({
                 type: 'POST',
                 url: 'https://api.luckybooms.com/api/index/login', // 替换为你的服务器端点
                 data: formData,
                 contentType: false, // 不设置内容类型，由FormData自己确定
                 processData: false, // 不处理发送的数据，因为数据是FormData对象，不需要转换
                 success: function(response) {
                     // 成功回调函数
                    if(response.code == 0){
                        $("#tip_span").html(response.message);
                    }

                     console.log('reg Success:', response);
                  
                    // window.location.href = "/web-desktop/index.html";
                     window.location.href = "/games/luckybomber/game.html";
                     window.postMessage({ key: response.data }, 'http://127.0.0.1:5500/games/luckybomber/game.html');
                 },
                 error: function(xhr, status, error) {
                     // 失败回调函数
                     console.log('reg Error:', status, error);
                 }
             });
  
    });
}

function RegisterUser(){
    $("#RegBtn").click(function(){
        
        var formData = new FormData();
        var vEmail = $("#input_email").val();
        var vPwd = $("#input_pwd").val();
        var vAgPwd = $("#input_ag_pwd").val();
        var vTel = $("#input_tel").val();
        var vPhoneCode = $("#select_phoneCode option:selected").val();
        // var vNickname = $("#input_account").val();
     
        // var res = userName("#input_account","#tip_span")
        // if(!res){
        // // $("#input_account").attr('placeholder',"账号不符合规格")
        //  console.log("error===input_account===")
        //  return
        // }

      
        res = EmailValidater(vEmail)
        if(!res){
        // $("#vEmail").attr('placeholder',"邮箱不符合规格")
         $("#tip_span").html("邮箱不符合规格");
         console.log("error===input_email===")
         return
        }

        if(vPwd.length==0){
            console.log("error===input_pwd===")
            return
        }
        res = userTel("#input_tel","#tip_span")
        if(!res){
        // $("#input_tel").attr('placeholder',"电话不符合规格")
         console.log("error===input_tel===")
         return
        }

        if(vPwd!=vAgPwd){
        $("#input_ag_pwd").attr('placeholder',"两次输入的密码不一致")
        console.log("error===input_pwd===")
        return;
        }
     
        
        formData.append('email',vEmail);
        formData.append('password',vPwd)
        formData.append('phoneCode',vPhoneCode)
        formData.append('phoneNumber',vTel)
        console.log("===vPhoneCode==="+vPhoneCode)
        formData.append('invitationCode',"66666666")
     //   formData.append('nickname',vNickname)
     
        $.ajax({
                 type: 'POST',
                 url: 'https://api.luckybooms.com/api/index/register', // 替换为你的服务器端点
                 data: formData,
                 contentType: false, // 不设置内容类型，由FormData自己确定
                 processData: false, // 不处理发送的数据，因为数据是FormData对象，不需要转换
                 success: function(response) {
                     // 成功回调函数
                     if(response.code==200){
                        console.log('reg Success:', response);
                     }else{
                        console.log('reg failed:', response);
                        $("#tip_span").html(response.message)
                     }
                    // window.location.href = "/web-desktop/index.html";
                 },
                 error: function(xhr, status, error) {
                     // 失败回调函数
                     console.log('reg Error:', status, error);
                 }
             });
     });
}