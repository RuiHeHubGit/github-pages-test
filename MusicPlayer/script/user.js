/**
 * Created by HeRui on 2017/4/25.
 */
function showPtDialog(titleText, info, mode, callback){
    dialogNode = document.createElement("div");
    dialogNode.innerHTML = '<div class="dialog-shade">\
		<div class="op-dialog">\
			<div class="dialog-title"></div>\
			<div class="content"></div>\
			<div class="btn-col">\
				<span class="dialog-confirm-btn">是</span>\
				<span class="dialog-cancel-btn">否</span>\
			</div>\
		</div>\
	</div>';
    document.body.appendChild(dialogNode);
    var dialog = dialogNode.getElementsByTagName("div")[1];
    var shade = dialog.parentNode;
    var divChilds = dialog.getElementsByTagName("div");
    var title = divChilds[0];
    var content = divChilds[1];
    var btnsPanel = divChilds[2];
    var btns = divChilds[2].getElementsByTagName("span");
    var confirmBtn = btns[0];
    var cancelBtn = btns[1];
    title.textContent = titleText;
    content.innerHTML = info;
    setTimeout(function(){
        shade.style.opacity = 1;
        if(mode != 0){
            var tout = null;
            shade.onclick = function(){
                if(tout == null){
                    dialog.style.opacity = 0.3;
                    tout = setTimeout(function(){
                        dialog.style.opacity = 1;
                        tout = null;
                    }, 200);
                }
            };
        }

        dialog.style.marginTop = "160px";

        if(mode == 0) {
            shade.style.height = 0;
            btnsPanel.style.display = "none";
            setTimeout(function(){
                closeDialog(shade, dialog, confirmBtn, cancelBtn);
            }, 2000);
        }
        else if(mode == 1){
            cancelBtn.style.display = "none";
            confirmBtn.onclick = function(){
                closeDialog(shade, dialog, confirmBtn, cancelBtn);
            };
        }else{
            confirmBtn.onclick = function(){
                if(callback != null)
                    callback();
                closeDialog(shade, dialog, confirmBtn, cancelBtn);
            };
            cancelBtn.onclick = function(){
                closeDialog(shade, dialog, confirmBtn, cancelBtn);
            };
        }
    }, 100);

    function closeDialog(shade, dialog, confirmBtn, cancelBtn){
        shade.style.opacity = 0;
        dialog.style.marginTop = "120px";
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        setTimeout(function(){
            var parent = dialog.parentNode.parentNode;
            document.body.removeChild(parent);
        }, 500);
    };
}

function initLoginPanelListener(){
    var dialog = document.getElementById("login-dialog");
    var shade = dialog.parentNode;
    var errorInfo =document.getElementById("login-name-pt");
    var userName = document.getElementById("user-name");
    document.getElementById("login-btn").onclick = function(){
        shade.style.display = "block";

        setTimeout(function(){
            shade.style.opacity = 1;
            dialog.style.marginTop = "150px";
            userName.focus();
        }, 100);
    };
    userName.onfocus = function(){
        errorInfo.textContent = "";
    };
    document.getElementById("login-sumbit-btn").onclick = function(){
        closeDialog();
        showPtDialog("提示", "登录成功！", 0, null);
    };
    document.getElementById("login-cancel-btn").onclick = function(){
        closeDialog();
    };

    function closeDialog(){
        errorInfo.textContent = "";
        shade.style.opacity = 0;
        dialog.style.marginTop = "100px";
        setTimeout(function(){
            shade.style.display = "none";
        }, 500);
    }

}

function initRegisterPanelListener(){
    var dialog = document.getElementById("register-dialog");
    var shade = dialog.parentNode;
    var errorInfo =document.getElementById("register-name-pt");
    var userName = document.getElementById("register-user-name");
    document.getElementById("register-btn").onclick = function(){
        shade.style.display = "block";

        setTimeout(function(){
            shade.style.opacity = 1;
            dialog.style.marginTop = ((window.innerHeight-dialog.offsetHeight) / 2 - 50)+"px";
            userName.focus();
        }, 100);
    };
    userName.onfocus = function(){
        errorInfo.textContent = "";
    };
    document.getElementById("register-sumbit-btn").onclick = function(){
        closeDialog();
        showPtDialog("提示", "注册成功！", 0, null);
    };
    document.getElementById("register-cancel-btn").onclick = function(){
        closeDialog();
    };

    function closeDialog(){
        errorInfo.textContent = "";
        shade.style.opacity = 0;
        dialog.style.marginTop = ((window.innerHeight-dialog.offsetHeight) / 2 - 100)+"px";
        setTimeout(function(){
            shade.style.display = "none";
        }, 500);
    }

}



function setUserBtn(){
    var btn_showSelect = document.getElementById("user-btn");
    var select = document.getElementById("user-select");
    btn_showSelect.onclick = function() {
        if(select.style.display == "none")
            select.style.display="block";
        else
            select.style.display="none";
    }
    document.body.onmousemove = function(e){
        if(e.x < select.getBoundingClientRect().left || e.x > select.getBoundingClientRect().right
            || e.y < select.getBoundingClientRect().top - 30 || e.y > select.getBoundingClientRect().bottom)
            select.style.display="none";
    }
}


function initializeUser(){
    initLoginPanelListener();
    initRegisterPanelListener();
    setUserBtn();
}