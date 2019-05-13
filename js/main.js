
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function collapse() {
    $('.comment').each(function(i){
        $(this).nextUntil('tr.comment').slideToggle(100, function(){
        });
    });
    $('.comment').click(function(){
        $(this).nextUntil('tr.comment').slideToggle(100, function(){
        });
    });
}



function getData(credJSON,fname,callback) {
    var xmlhttp;
    if (window.XMLHttpRequest){
        xmlhttp=new XMLHttpRequest();
    }else{
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            callback(xmlhttp.responseText);
        }
    }

    xmlhttp.open("POST",fname,true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("cred="+credJSON);
}

(function ($) {
    "use strict";


    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            document.getElementById("response").innerHTML="";
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })

    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit',function(){
        var check = true;
        var butOrig = document.getElementById("loading").innerHTML;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }
        if(check==true){
            
            $.ajax({
                url: "load.html", 
                context: document.body,
                success: function(response) {
                    $("#loading").html(response);
                }
            });

            var id = (document.getElementById('dynID').value);
            var pass = (document.getElementById('pass').value);
            var cred = '{ "id":"'+id+'" , "pass":"'+pass+'" }';
            var credJSON = JSON.stringify(cred);


            getData(credJSON,"php/login.php",function(resJSON){
                if (resJSON.length > 10){
                    document.cookie="token="+resJSON+"";
                    document.cookie="dynectUser="+id+"";
                    //console.log(getCookie("token"));     //TESTING PURPOSES
                    var token = encodeURIComponent(getCookie("token"));
                    getData(JSON.stringify('{ "token":"'+token+'" }'),"php/initiateSession.php",function(resJSON){
                        $.ajax({
                            url: "dashboard.html", 
                            context: document.body,
                            success: function(response) {
                                $("#main").html(response);
                                $("#wlm").html("Welcome "+id);
                                $("#tableBody").html(resJSON);
                                document.getElementById("save").style.display = "none";
                                document.getElementById("update").style.display = "block";
                                collapse();
                            }
                        });
                    });

                }else{
                    //console.log(resJSON); //TESTING
                    document.getElementById("response").innerHTML="Login Unsuccessful";
                    document.getElementById("loading").innerHTML=butOrig;
                    return false;
                }
            });

        }
        return false;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    /*==================================================================
    [ Show pass ]*/
    var showPass = 0;
    $('.btn-show-pass').on('click', function(){
        if(showPass == 0) {
            $(this).next('input').attr('type','text');
            $(this).find('i').removeClass('zmdi-eye');
            $(this).find('i').addClass('zmdi-eye-off');
            showPass = 1;
        }
        else {
            $(this).next('input').attr('type','password');
            $(this).find('i').addClass('zmdi-eye');
            $(this).find('i').removeClass('zmdi-eye-off');
            showPass = 0;
        }
        
    });


})(jQuery);

var ipChangeDict = {};

$(document)
    .on('focus.expand', 'textarea.expand', function(){
        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
    })
    .on('input.expand', 'textarea.expand', function(){
        var minRows = this.getAttribute('data-min-rows')|0, rows;
        this.rows = minRows;
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 16);
        this.rows = minRows + rows;
    });

var loading = function(e) {

    e.preventDefault();
    e.stopPropagation();
    e.target.classList.add('loading');
    e.target.setAttribute('disabled','disabled');

    var checkboxes = document.getElementsByClassName('serverCB');
    var checkboxesChecked = "";
    for (var i=0; i<checkboxes.length; i++) {
     if (checkboxes[i].checked) {
        checkboxesChecked += checkboxes[i].dataset.row+','+checkboxes[i].dataset.col+";";
        if(checkboxes[i].dataset.domainname in ipChangeDict){
            if(!(ipChangeDict[checkboxes[i].dataset.domainname].includes(checkboxes[i].dataset.ip))){
                ipChangeDict[checkboxes[i].dataset.domainname].push(checkboxes[i].dataset.ip);
            }
        }
     }
    }
    reviewTxt = "";
    for(var zo in ipChangeDict){
        reviewTxt += zo +":  ";
        for(var i = 0; i < ipChangeDict[zo].length; i++){
            reviewTxt += ipChangeDict[zo][i] +", ";
        }
        reviewTxt = reviewTxt.slice(0, -2);
        reviewTxt += "\n";
    }

    swal({ 
    title: "Review",   
    text: reviewTxt,   
    showCancelButton: true,   
    confirmButtonColor: "#32A80D",   
    confirmButtonText: "Confirm",   
    cancelButtonText: "Cancel",   
    closeOnConfirm: true,   
    closeOnCancel: true }, 
    function(isConfirm){   
        if (isConfirm) 
        {   
            var token = encodeURIComponent(getCookie("token"));
            var user = getCookie("dynectUser");
            var credJSON = JSON.stringify('{ "token":"'+token+'" , "listUpdate":"'+checkboxesChecked+'", "user":"'+user+'"}');

            getData(credJSON,"php/update.php",function(resJSON){
                var idtype = "";
                console.log(resJSON);
                if (resJSON.charAt(0).localeCompare('E') == 0){
                    idtype = "alert";
                }else if (resJSON.charAt(0).localeCompare('S') == 0){
                    idtype = "alerts";
                }else{
                    idtype = "alert";
                }
                if (resJSON.charAt(0).localeCompare('') == 0){
                    $('#alertmsg').html('<div id="alertw"><span id="closebtn" onclick="closeAlert()">&times;</span>Nothing to update!</div>');
                }else{
                    $('#alertmsg').html('<div id="'+idtype+'"><span id="closebtn" onclick="closeAlert()">&times;</span>'+resJSON+'</div>');
                }
                e.target.classList.remove('loading');
                e.target.removeAttribute('disabled');
            });
            ipChangeDict = {};
        }
        else{
            e.target.classList.remove('loading');
            e.target.removeAttribute('disabled');
        }
    });
};

var btns = document.querySelectorAll('#update');
for (var i=btns.length-1;i>=0;i--) {
  btns[i].addEventListener('click',loading);
}

var logout = function(e) {
    var token = encodeURIComponent(getCookie("token"));
    getData(JSON.stringify('{ "token":"'+token+'" }'),"php/logout.php",function(resJSON){
        console.log(resJSON);    //TESTING
        $.ajax({
            url: "indexBody.html", 
            context: document.body,
            success: function(response) {
                $("#main").html(response);
            }
        });
    });
    $.ajax({
        url: "load.html", 
        context: document.body,
        success: function(response) {
            document.getElementById("timeLoad").innerHTML = response;
        }
    });
}

var btns = document.querySelectorAll('#logout');
for (var i=btns.length-1;i>=0;i--) {
  btns[i].addEventListener('click',logout);
}

function closeAlert(){
    document.getElementById("alertmsg").innerHTML = "";
}


function edit() {
    var token = encodeURIComponent(getCookie("token"));
    var credJSON = JSON.stringify('{ "token":"'+token+'"}');
    $.ajax({
        url: "load.html", 
        context: document.body,
        success: function(response) {
            document.getElementById("timeLoad").innerHTML = response;
        }
    });

    getData(credJSON,"php/edit.php",function(resJSON){
        document.getElementById("tableBody").innerHTML = resJSON;
        document.getElementById("edit").innerHTML = '<input type="image" src="images/icons/home.png" height="20" width="20"/>&nbsp;&nbsp;';
        document.getElementById("add").innerHTML = '<button onclick = "add()"><input type="image" src="images/icons/plus.png" height="20" width="20"/></button>';
        document.getElementById("edit").setAttribute('onclick',"home()");
        document.getElementById("reset").setAttribute('onclick',"edit()");
        document.getElementById("save").style.display = "block";
        document.getElementById("update").style.display = "none";
        document.getElementById("timeLoad").innerHTML = "";
        $("#dataTable").tableDnD(); 
    });
}

function home() {
    $.ajax({
        url: "load.html", 
        context: document.body,
        success: function(response) {
            document.getElementById("timeLoad").innerHTML = response;
        }
    });
    var token = encodeURIComponent(getCookie("token"));
    getData(JSON.stringify('{ "token":"'+token+'" }'),"php/initiateSession.php",function(resJSON){
        document.getElementById("tableBody").innerHTML = resJSON;
        document.getElementById("add").innerHTML = '';
        document.getElementById("edit").innerHTML = '<input type="image" src="images/icons/edit.png" height="20" width="20"/>&nbsp;&nbsp;';
        document.getElementById("edit").setAttribute('onclick',"edit()");
        document.getElementById("reset").setAttribute('onclick',"home()");
        document.getElementById("save").style.display = "none";
        document.getElementById("update").style.display = "block";
        document.getElementById("timeLoad").innerHTML = "";
        ipChangeDict = {};
        collapse();
    });
}


var save = function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.add('loading');
    e.target.setAttribute('disabled','disabled');

    var ipdata = ""; var count = 0; var subIpdata = "";
    var arr = document.getElementsByClassName("expand");
    for(var i = 0; i < arr.length+1; i++){
        if(count < 4){
            subIpdata += arr[i].value + ";";
            count += 1;
        }else{
            //console.log(subIpdata);   //TESTING PURPOSES
            subIpdata = subIpdata.substring(0, subIpdata.length - 1);
            if(!(subIpdata==";;;")){ipdata += subIpdata;}
            if(i != arr.length){i -= 1;if(!(subIpdata==";;;")){ipdata += "\\n";}}
            subIpdata = "";
            count = 0;
        }
    }
    ipdata = "domain;aws;ec;pa\\n"+ipdata;
    //console.log(ipdata);  //TESTING PURPOSES

    var succ = true;
    var dupli = "";
    for(var i = 0; i < arr.length; i += 4){
        var domainN = arr[i].value;
        for(var ii = 0; ii < arr.length; ii += 4){
            if(i != ii){
                if(arr[ii].value.localeCompare(domainN) == 0)
                {
                    succ = false;
                    dupli = domainN;
                    break;
                }
            }
        }
        if(succ == false)
        {
            break;
        }
    }

    if(succ){
        var user = getCookie("dynectUser");
	var credJSON = JSON.stringify('{ "ipdata":"'+ipdata+'", "user":"'+user+'"}');
        getData(credJSON,"php/save.php",function(resJSON){
            if (resJSON.charAt(0).localeCompare('') == 0){
                $('#alertmsg').html('<div id="alerts"><span id="closebtn" onclick="closeAlert()">&times;</span>Successfully saved!</div>');
            }else{
                $('#alertmsg').html('<div id="alert"><span id="closebtn" onclick="closeAlert()">&times;</span>Failed</div>');
            }
            e.target.classList.remove('loading');
            e.target.removeAttribute('disabled');
        });
    }else{
        $('#alertmsg').html('<div id="alert"><span id="closebtn" onclick="closeAlert()">&times;</span>Error: Duplicate domain exists: '+dupli+' </div>');
        e.target.classList.remove('loading');
        e.target.removeAttribute('disabled');
    }
}

var btns = document.querySelectorAll('#save');
for (var i=btns.length-1;i>=0;i--) {
  btns[i].addEventListener('click',save);
}

function add() {
    var tBody = document.getElementById("tableBody").innerHTML;
    tBody += '<tr role="row" class="even"><td class="sorting_1"><textarea class="expand" rows="1" placeholder="Domain"></textarea></td><td><textarea class="expand" rows="1" placeholder="AWS"></textarea></td><td><textarea class="expand" rows="1" placeholder="EC"></textarea></td><td><textarea class="expand" rows="1" placeholder="PA"></textarea></td></tr>';
    document.getElementById("tableBody").innerHTML = tBody;
    $("#dataTable").tableDnD();     
}

function toggleButt(e)
{
    if(e.checked){
        if(e.dataset.domainname in ipChangeDict){
            if(!(ipChangeDict[e.dataset.domainname].includes(e.dataset.ip))){
                ipChangeDict[e.dataset.domainname].push(e.dataset.ip);
            }
        }else{
            ipChangeDict[e.dataset.domainname] = [e.dataset.ip];
        }
    }else{
        if(e.dataset.domainname in ipChangeDict){
            ipChangeDict[e.dataset.domainname] = ipChangeDict[e.dataset.domainname].filter(function(value, index, arr){return value != e.dataset.ip; });
        }else{
            ipChangeDict[e.dataset.domainname] = [];
        }
    }

}

