/*!
 * 修改价格javascript主程序 v4.2.2
 * 请在jQuery环境下执行
 *
 * Copyright GZL International Travel Sevice Ltd.
 *
 * Date: Mon Feb 17 2014
 * Writen by jamieTsang 331252914@qq.com
 * Class
 * import Class Page.js
 * import Class Response.js
 */
$(function () {
	var $body=$('body');
	var tdWidth=[37,37,80];
	var htmlWriter = "";//alert(exp.toGMTString());


	//获取及判断visa文件夹
    Page.getVisa=function(){
		var pattern=/\?visa=(\w+)/i;
		var visa=Page.location.match(pattern);
		if(visa){
			return visa[1];
		}else{
			return false;
		}
	};
	//绑定hover变色
	function bind() {}
	$.ajaxSetup({
		type : "GET",
		url : 'edit.aspx',
		dataType : 'html',
		cache : "false", //IE缓存问题
		timeout : 5000
	});

	//创建记录保存更改数组
	//var Page.Editor=[];
	//判断用户

    Page.checkAccout(creatXHR);
	//初始化，ajax读取数据
	function creatXHR() {
		var address;
		if(!Page.getVisa()){
			address = Page.getDocumentName();
		}else{
			address = 'outboardvisa/'+Page.getVisa();
		}
        if (!((address == "" || address == null) && !address)) {
            $.ajax({
                type: "GET",
                url: '/subject/' + address + '/scripts/data.xml?t=' + Math.random(),
                dataType: 'xml',
                //async: "Ture",
                timeout: 20000,
                error: function (XMLHttpRequest, strError, strObject) {
                    //console.log(urlString);
                    alert("亲,加载xml失败,请检查路径是否正确！");
                },
                success: function (xml) {
                    //获取标题名称
                    var subjectTitle = (Page.getVisa() != false) ? ('签证：' + address.substr(13)) : address;
                    htmlWriter += "<h1>专辑标题：<a target='_blank' href='/subject/" + address + "/index.htm'>" + subjectTitle + "</a><i><a target='_blank' href='/subject/" + address + "/scripts/data.xml'>查看线路源数据xml</a></i><i>(线路修改页面,请使用最新版Chrome浏览器)</i>v4.2.5 更新日期20140421</h1><p><b>输入框转义符：</b><b>1.换行符，回车：</b>[br]=&lt;br/\&gt;;；<b>2.加粗：</b>[b]例子[/b]=&lt;b&gt;<b>例子</b>&lt;/b&gt;;；<b>3.字号大小(未支持)：</b>[fs=12]12号字体[/fs]=&lt;font style=\"font-size:12px\"&gt;<font style='font-size:12px'>12号字体</font>&lt;/font&gt;;；可嵌套使用。<br/><b>升级内容:</b>1.xml文件检查；2.全选、反选功能</p><div id='create' class='create'><button id='createBtn' class='createBtn'>生成静态页面</button><div id='upLoader' class='upLoader'><div class='borderBox'>HTML文件上传区<p>请拖动文件到此处</p></div></div></div>";
                    //获取xml版本号
                    var xmlVer = $(xml).find('version').text();
                    xmlVer = Number(xmlVer);
                    //按照版本作出不同显示
                    var fn = new Array(1);
                    for (i = 0; i < fn.length; i++)
                        fn[i] = false;
                    switch (xmlVer) {
                        case 4.0:
                            break;
                        default:
                            htmlWriter += "";
                            break;
                    }
                    //填写表格头部
                    htmlWriter += "<div class='static'><dl id='tableHead' class='tableHead'><dt>编号</dt><dt>上架</dt><dt>售罄 <a href='javascript:void(0);' id='allSelected' onclick='allSelected'>全选</a> <a id='deSelected' href='javascript:void(0);'>反选</a></dt><dt>标题</dt><dt>价格</dt><dt class='last'>链接</dt></dl></div>"
                    htmlWriter += "<div id='dataintable'><table class='dataintable'><tbody>";
                    $(xml).find("line").each(function (i) {
                        var num = $(this).attr("id"); //获得编号
                        var display = $(this).find('display').text(); //获得是否隐藏
                        var displayHTML = "";
                        if (display == "Y") {
                            displayHTML = "<td width='" + tdWidth[1] + "'><input class='checkbox checkType editZoom' type='checkbox' checked='checked' value='Y' edit-Line='" + i + "' edit-Index='0' /></td>";
                        } else {
                            displayHTML = "<td width='" + tdWidth[1] + "'><input class='checkbox checkType editZoom' type='checkbox' value='N' edit-Line='" + i + "' edit-Index='0' /></td>";
                        }
                        var soldout = $(this).find('soldout').text(); //获得是否售罄
                        var soldoutHTML = "";
                        if (soldout == "Y") {
                            soldoutHTML = "<td width='" + tdWidth[2] + "'><input class='soldout checkType editZoom' type='checkbox' checked='checked' value='Y' edit-Line='" + i + "' edit-Index='1' /></td>";
                        } else {
                            soldoutHTML = "<td width='" + tdWidth[2] + "'><input class='soldout checkType editZoom' type='checkbox' value='N' edit-Line='" + i + "' edit-Index='1' /></td>";
                        }
                        var title = $(this).find('title').text(); //获得标题
                        var titleHtml = "<textarea id='title' name='title' class='title inputType editZoom' cols='1' edit-Line='" + i + "' edit-Index='2'>" + title + "</textarea>";
                        var ishasRemarks = $(this).find('remark').children().length;
                        var remarkHTML = '';
                        if (ishasRemarks > 0) {
                            remarkHTML += "<tr><td></td><td></td><td></td><td colspan='3'>";//初始化读取备注
                            var remark = new Array();
                            var remarkName = new Array();
                            var tagName = '';
                            for (j = 0; j < ishasRemarks; j++) {
                                remark[j] = $(this).find('remark').children(':eq(' + j + ')').text();//获得备注
                                tagName = $(this).find('remark').children(':eq(' + j + ')').attr('tag');//获得备注名称
                                tagName = (tagName == undefined) ? '' : '(' + tagName + ')';
                                remarkHTML += "<p class='remark'><span>备注" + j + tagName + ":<span> <br/><textarea id='remark' class='remark inputType editZoom title' type='text' rel=" + j + " edit-Line='" + i + "' edit-Index='5' edit-remark='" + j + "' cols='1'>" + remark[j] + "</textarea></p>";
                                tagName = '';
                            }
                            remarkHTML += '</td></tr>';
                        }
                        var price = $(this).find('price').text(); //获得价格
                        var priceHtml = "<input id='price' type='text' value='" + price + "' class='price inputType editZoom' edit-Line='" + i + "' edit-Index='3'/>";
                        var alink = $(this).find('link').text(); //获得链接
                        var alinkHtml = "<input type='url' id='alink' class='alink inputType editZoom' value='" + alink + "' edit-Line='" + i + "' edit-Index='4'/><a href='" + alink + "' target='_blank' class='checkLink'>查看链接</a>";
                        if (Page.getHashNumber != null && i == Page.getHashNumber) {
                            htmlWriter += "<tr id='L" + i + "' BGCOLOR='#FFC' class='focus'><td colspan='6' class='cols'><table width='100%'><tr id='row'><td width='" + tdWidth[0] + "'>" + num + "</td>" + displayHTML + soldoutHTML + "<td>" + titleHtml + "</td><td>" + priceHtml + "</td><td>" + alinkHtml + "</td></tr>" + remarkHTML + "</table></td></tr>";
                        }
                        else if (i % 2 == 0) {
                            //if (i % 2 == 0) {
                            htmlWriter += "<tr id='L" + i + "' BGCOLOR='#DDD'><td colspan='6' class='cols'><table width='100%'><tr id='row'><td width='" + tdWidth[0] + "'>" + num + "</td>" + displayHTML + soldoutHTML + "<td>" + titleHtml + "</td><td>" + priceHtml + "</td><td>" + alinkHtml + "</td></tr>" + remarkHTML + "</table></td></tr>";
                        } else {
                            htmlWriter += "<tr id='L" + i + "' BGCOLOR='#F4F4F4'><td colspan='6' class='cols'><table width='100%'><tr id='row'><td width='" + tdWidth[0] + "'>" + num + "</td>" + displayHTML + soldoutHTML + "<td>" + titleHtml + "</td><td>" + priceHtml + "</td><td>" + alinkHtml + "</td></tr>" + remarkHTML + "</table></td></tr>";
                        }
                    });
                    htmlWriter += "</tbody></table></div>";
                    htmlWriter += "<div id='botSave'><input name='submit' type='button' value='一键保存' id='oneKeySave' class='submit'><button id='createBtn' class='createBtn'>生成静态页面</button></div>";

                    $body.html(htmlWriter);
                    Response.uiController.DrawBox();
                    $('#tableHead').fixedObject({floatContent: $('#dataintable')});
                    function headWidth() {
                        $('#tableHead').find('dt').each(function (i, e) {
                            var width = parseInt($('#row td:eq(' + i + ')').outerWidth());
                            if (i == 0) {
                                $(e).css('width', width + 1);
                            }
                            else if (i > 0 && i < 4) {
                                $(e).css('width', width - 1);
                            } else {
                                $(e).css('width', width);
                            }
                        });
                    };
                    headWidth();
                    $(window).resize(function () {
                        headWidth()
                    });
                    $("#allSelected").click(function () {
                        $('.soldout[value!=Y]').each(function (i) {
                            var _this = $(this);
                            changeCheckBox(_this);
                            changeRecord(_this);
                            _this.parent().addClass('blur' + i + ' edited').css("background-color", "#FFC").attr("blur", i);
                            _this.attr("checked", true);
                        });
                        //console.log(Page.Editor);
                    });
                    $("#deSelected").click(function () {
                        $('.soldout').each(function (i) {
                            var _this = $(this);
                            _this.parent().addClass('blur' + i + ' edited').css("background-color", "#FFC").attr("blur", i);
                            this.checked = !this.checked;
                            changeCheckBox(_this);
                            changeRecord(_this);
                        });
                        //console.log(Page.Editor);
                    });
                    //$('.focus').find('.title').focus();//标题获取焦点
                    $(".dataintable tr").hover(function () {
                        $(this).addClass('hover');
                    }, function () {
                        $(this).removeClass('hover');
                    });
                    //复选框变更
                    function changeCheckBox(e) {
                        var val = e.val();
                        if (val == "Y")
                            val = "N";
                        else
                            val = "Y";
                        e.val(val);
                    };
                    //复选框上架点击变更
                    $('.checkbox').click(function () {
                        changeCheckBox($(this));
                    });
                    //复选框售罄点击变更
                    $('.soldout').click(function () {
                        changeCheckBox($(this));
                    });
                    //按下保存按钮执行保存
                    $('#oneKeySave').click(function () {
                        //Response.uiController.showLoadingBar();
                        $('#loading_unit').fadeIn('normal');
                        $(".edited,.editZoom").css("background-color", "").attr("blur", "-1");
                        for (i = 0; i < Page.Editor.length; i++) {
                            savePreferences(i);
                        }
                        icount = -1;
                        Page.clearEditor();//清空数组，释放缓存
                        setTimeout("$('#loading_unit').fadeOut(500)", 3800);
                    });
                    //发送保存数据到服务器端处理
                    function savePreferences(i) {
                        var dataObject = {};
                        if (Page.Editor[i].index != 5) {
                            dataObject = {//一般输入框
                                line: Page.Editor[i].line,
                                index: Page.Editor[i].index,
                                value: encodeURI(Page.Editor[i].value.filter()),
                                path: address
                            }
                        } else {
                            dataObject = {//备注框
                                line: Page.Editor[i].line,
                                index: Page.Editor[i].index,
                                value: encodeURI(Page.Editor[i].value.filter()),
                                remark: Page.Editor[i].remark,
                                path: address
                            }
                        }
                        $.ajax({
                            data: dataObject,
                            type: "POST",
                            url: 'edit.ashx',
                            timeout: 20000,
                            async: false,//设置为同步，必须等待服务器返回结果后才继续执行,这个很重要
                            beforeSend: function () {
                                Response.uiController.showLoadingBar();
                            },
                            error: function (XMLHttpRequest, strError, strObject) {
                                Response.resultFalure++;
                                $(".blur" + i).css("background-color", "#FCC").removeClass("blur" + i);
                            },
                            success: function (strValue) {
                                Response.uiController.hideLoadingBar();
                                if (strValue == "True") {
                                    Response.resultSuccess++;
                                    $(".blur" + i).css("background-color", "#CFC").removeClass("blur" + i);
                                } else {
                                    Response.resultFalure++;
                                    $(".blur" + i).css("background-color", "#F96").removeClass("blur" + i);
                                }
                            },
                            complete: function () {
                                Response.uiController.showComputedResult(i);
                            }
                        });
                    }

                    //设置获得焦点的editZoom（编辑区）变色并记录到数组中
                    var icount = -1;
                    $(".inputType").blur(function () {
                        var $this = $(this);
                        changeRecord($this);
                        $this.css("background-color", "#FFC").attr("blur", icount).addClass("blur" + icount);
                        //console.log(icount);
                    });
                    $(".checkType").click(function () {
                        var $this = $(this);
                        changeRecord($this);
                        $this.attr("blur", icount).parent().css("background-color", "#FFC").attr("blur", icount).addClass("blur" + icount).addClass("edited");
                    });
                    //获取记录数据，添加到数组，显示保存按钮
                    function changeRecord($this) {
                        if (!$this.attr("blur") || $this.attr("blur") == "-1") {
                            if ($this.attr("id") != "remark") {
                                Page.Editor.push({line: $this.attr("edit-line"), index: $this.attr("edit-index"), value: $this.val()});
                            } else {
                                Page.Editor.push({line: $this.attr("edit-line"), index: $this.attr("edit-index"), remark: $this.attr("edit-remark"), value: $this.val()});
                            }
                            icount++;
                        } else {
                            var tg = Number($this.attr("blur"));
                            //console.log(Page.Editor[tg]);
                            Page.Editor[tg].value = $this.val();
                        }
                        $("#botSave").stop().animate({"bottom": 0}, 600);
                    };
                    $body.find('#createBtn').click(function () {
                        creatStaticFiles();
                    });
                    //生成静态htm文件
                    function creatStaticFiles() {
                        //$('#loading_unit p').html("<img src='/subject/edit/images/loading_bar.gif' />");
                        //Response.uiController.showLoadingBar();
                        $.ajax({
                            data: {path: address},
                            type: "POST",
                            url: 'create.ashx',
                            timeout: 50000,
                            async: false,
                            error: function (XMLHttpRequest, strError, strObject) {
                                Response.uiController.showFailure();
                            },
                            beforeSend: function () {
                                Response.uiController.showLoadingBar();
                            },
                            success: function (strValue) {
                                if (/True/.test(strValue) && !/False/.test(strValue)) {
                                    Response.uiController.showSuccess();
                                    setTimeout("$('#loading_unit').fadeOut(500)", 3800);
                                } else {
                                    Response.uiController.showFailure();
                                }
                            },
                            complete: function () {
                                Response.uiController.showResult();
                            }
                        });
                        $("#botSave").stop().animate({"bottom": -85}, 600);
                    };
                    //拖动上传html文件
                    $("#upLoader").html5Uploader({
                        name: "File",
                        postUrl: 'upload.ashx',
                        onSuccess: function () {
                            $.ajax({
                                type: 'POST',
                                url: 'upload.ashx',
                                timeout: 50000,
                                data: {
                                    'cmd': 'moveFile',
                                    'url': '/subject/' + address + '/templates/'
                                },
                                async: false,
                                success: function (strValue) {
                                    if (/True/.test(strValue) && !/False/.test(strValue)) {
                                        creatStaticFiles();
                                    } else {
                                        Response.uiController.showFailure(strValue);
                                    }
                                },
                                error: function (XMLHttpRequest, strError, strObject) {
                                    Response.uiController.showFailure(strObject);
                                },
                                complete: function () {
                                    Response.uiController.showResult();
                                }
                            });
                        }
                    });
                    if (Page.getHashNumber()) {
                        console.log(Page.getHashNumber());
                        var top = $('tr#L' + Page.getHashNumber()).offset().top - 30;
                        $('html,body').animate({scrollTop: top}, 300);
                    }
                }
            });
        } else {
            alert("参数无效！");
        }
	}
});