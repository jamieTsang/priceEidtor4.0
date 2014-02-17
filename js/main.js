/*!
 * 修改价格javascript主程序 v4.2.1
 * 请在jQuery环境下执行
 *
 * Copyright GZL International Travel Sevice Ltd.
 *
 * Date: Thu Jul 04 2013
 * Writen by jamieTsang 331252914@qq.com 
 */
$(function () {
	var $body=$('body');
	var tdWidth=[37,37,80];
	var htmlWriter = "";	//alert(exp.toGMTString());
	//获取url里的?后的文件夹参数;1:为文件名;2:为锚点
	function getURL(param) {
		var url_para = String(window.location);
		if(param==1&&url_para.match("#")){
			url_para=url_para.match(/#\d+/g);
			return url_para.toString().replace(/#/g,"");
		}else if(param==0&&url_para.match(/\?/)){
			url_para=url_para.match(/\?\d{6}_\w+_*\w+/g);
			return url_para.toString().replace(/\?/g,"");
		}else{
			return null;
		}
	}
	//获取#号前的url
	function getTrueURL() {
		var aParams = new Array();
		var url_para = String(window.location);
		url_para = url_para.split("#");
		return url_para[0];
	}
	//绑定hover变色
	function bind() {}
	$.ajaxSetup({
		type : "GET",
		url : 'edit.aspx',
		dataType : 'html',
		cache : "false", //IE缓存问题
		timeout : 5000
	});
	function returnToLogin(){
	    window.location.href = "http://www.gzl.com.cn/Users/Login.aspx?ReturnUrl=%2fsubject%2fedit%2fdefault.html";
	}
	//创建记录保存更改数组
	var ArarryEditor=[];
	//判断用户
	$.ajax({
		url : '/Users/AjaxHandler/LoginCheck.aspx',
        type: "post",
        async: true,
		data: "checktype=getinfouser",
		error : function (XMLHttpRequest, strError, strObject) {
			alert("ajax服务器请求超时！错误详情" + strObject);
		},
		success : function (json) {
			var arrJson = new Array();
			var models = eval("(" + json + ")");
			var userName=models.UserName;
			var userId=models.UserID;
			var adress = getURL(0);
			if (userId > 0) {
				$.ajax({
					type : "POST",
					data : {
						name : encodeURI(userName),
						url : encodeURI(adress)
					},
					url : '/subject/edit/login.aspx',
					timeout : 20000,
					error : function (XMLHttpRequest, strError, strObject) {
						$body.text("请先登录！5秒后跳转到登陆页...");
						var t=setTimeout(returnToLogin,5000);
					},
					success : function (response) {
						if (response == "True"){
							var adminCookie=new GzlCookie("admin");
							adminCookie.setCookie("Checked",30);
							creatXHR();
						}else{
							$body.text("非指定用户！");
							var t=setTimeout("window.location.href ='http://www.gzl.com.cn/error/Error404.html'",1000);
						}
					}
				})
			}else{
				$body.text("请先登录！5秒后跳转到登陆页...");
				var t=setTimeout(returnToLogin,5000);
			}
		}
	});
	//初始化，ajax读取数据
	function creatXHR() {
		var adress = getURL(0);
		if (adress == "" || adress == null) {
			alert("参数无效！");
		} else {
			$.ajax({
				type : "GET",
				url : '/subject/' + adress + '/scripts/data.xml?t='+Math.random(),
				dataType : 'xml',
				//async: "Ture",
				timeout : 20000,
				error : function (XMLHttpRequest, strError, strObject) {
					alert("亲,加载xml失败,请检查路径是否正确！");
				},
				success : function (xml) {
					//获取标题名称
					var subjectTitle = adress;
					htmlWriter += "<h1>专辑标题：<a target='_blank' href='/subject/"+adress+"/index.htm'>" + subjectTitle + "</a><i><a target='_blank' href='/subject/"+adress+"/scripts/data.xml'>查看线路源数据xml</a></i><i>(线路修改页面,请使用最新版Chrome浏览器)</i>v4.2.1 更新日期20131125</h1><p><b>输入框转义符：</b><b>1.换行符，回车：</b>[br]=&lt;br/\&gt;;；<b>2.加粗：</b>[b]例子[/b]=&lt;b&gt;<b>例子</b>&lt;/b&gt;;；<b>3.字号大小(未支持)：</b>[fs=12]12号字体[/fs]=&lt;font style=\"font-size:12px\"&gt;<font style='font-size:12px'>12号字体</font>&lt;/font&gt;;；可嵌套使用。<br/><b>升级内容:</b>1.xml文件检查；2.全选、反选功能</p><div id='create' class='create'><button id='createBtn' class='createBtn'>生成静态页面</button><div id='upLoader' class='upLoader'><div class='borderBox'>HTML文件上传区<p>请拖动文件到此处</p></div></div></div>";
					//获取xml版本号
					var xmlVer = $(xml).find('version').text();
					xmlVer = Number(xmlVer);
					//按照版本作出不同显示
					//xmlVersion(xmlVer);
					//创建版本支持情况数组
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
					htmlWriter +="<div class='static'><dl id='tableHead' class='tableHead'><dt>编号</dt><dt>上架</dt><dt>售罄 <a href='javascript:void(0);' id='allSelected' onclick='allSelected'>全选</a> <a id='deSelected' href='javascript:void(0);'>反选</a></dt><dt>标题</dt><dt>价格</dt><dt class='last'>链接</dt></dl></div>"
					htmlWriter += "<div id='dataintable'><table class='dataintable'><tbody>";
					var routecode=[];
					$(xml).find("line").each(function (i) {
						var num = $(this).attr("id"); //获得编号
						var display = $(this).find('display').text(); //获得是否隐藏
						var displayHTML = "";
						if (display == "Y") {
							displayHTML = "<td width='"+tdWidth[1]+"'><input class='checkbox checkType editZoom' type='checkbox' checked='checked' value='Y' edit-Line='"+i+"' edit-Index='0' /></td>";
						} else {
							displayHTML = "<td width='"+tdWidth[1]+"'><input class='checkbox checkType editZoom' type='checkbox' value='N' edit-Line='"+i+"' edit-Index='0' /></td>";
						}
						var soldout = $(this).find('soldout').text(); //获得是否售罄
						var soldoutHTML = "";
						if (soldout == "Y") {
							soldoutHTML = "<td width='"+tdWidth[2]+"'><input class='soldout checkType editZoom' type='checkbox' checked='checked' value='Y' edit-Line='"+i+"' edit-Index='1' /></td>";
						} else {
							soldoutHTML = "<td width='"+tdWidth[2]+"'><input class='soldout checkType editZoom' type='checkbox' value='N' edit-Line='"+i+"' edit-Index='1' /></td>";
						}
						var title = $(this).find('title').text(); //获得标题
						var titleHtml = "<textarea id='title' name='title' class='title inputType editZoom' cols='1' edit-Line='"+i+"' edit-Index='2'>" + title + "</textarea>";
						var ishasRemarks=$(this).find('remark').children().length;
						var remarkHTML='';
						if(ishasRemarks>0){
							remarkHTML+="<tr><td></td><td></td><td></td><td colspan='3'>";//初始化读取备注
							var remark=new Array();
							var remarkName=new Array();
							var tagName='';
							for(j=0;j<ishasRemarks;j++){
								remark[j]=$(this).find('remark').children(':eq('+j+')').text();//获得备注
								tagName=$(this).find('remark').children(':eq('+j+')').attr('tag');//获得备注名称
								tagName=(tagName==undefined)?'':'('+tagName+')';
								remarkHTML+="<p class='remark'><span>备注"+j+tagName+":<span> <br/><textarea id='remark' class='remark inputType editZoom title' type='text' rel="+j+" edit-Line='"+i+"' edit-Index='5' edit-remark='"+j+"' cols='1'>"+remark[j]+"</textarea></p>";
								tagName='';
							}
							remarkHTML+='</td></tr>';
						}
						var price = $(this).find('price').text(); //获得价格
						var priceHtml = "<input id='price' type='text' value='" + price + "' class='price inputType editZoom' edit-Line='"+i+"' edit-Index='3'/>";
						var alink = $(this).find('link').text(); //获得链接
						var alinkHtml="";
						var isAutoCheck=/\/travels\/|\/Outbound\/|\/inbound\/|\/province\/|\/cruise\/|\/freetrips\//i.test(alink);
						if(isAutoCheck){
							routecode.push({"id":i,"code":alink.match(/\/Detail_(\d+)/i)[1]});
							alinkHtml += '<div title="支持自动改价" class="isAutoCheck"></div>';
						}
						//console.log(isAutoCheck);
						alinkHtml += "<input type='url' id='alink' class='alink inputType editZoom' value='" + alink + "' edit-Line='"+i+"' edit-Index='4'/><a href='"+alink+"' target='_blank' class='checkLink'>查看链接</a>";
						if(getURL(1)!=null&&i==getURL(1)){
							htmlWriter += "<tr id='L" + i + "' BGCOLOR='#FFC' class='focus'><td colspan='6' class='cols'><table width='100%'><tr id='row'><td width='"+tdWidth[0]+"'>" + num + "</td>" + displayHTML + soldoutHTML + "<td>" + titleHtml +  "</td><td>" + priceHtml + "</td><td>" + alinkHtml + "</td></tr>"+remarkHTML +"</table></td></tr>";
						}
						else if (i % 2 == 0) {
						//if (i % 2 == 0) {
							htmlWriter += "<tr id='L" + i + "' BGCOLOR='#DDD'><td colspan='6' class='cols'><table width='100%'><tr id='row'><td width='"+tdWidth[0]+"'>" + num + "</td>" + displayHTML + soldoutHTML + "<td>" + titleHtml +"</td><td>" + priceHtml + "</td><td>" + alinkHtml + "</td></tr>"+remarkHTML +"</table></td></tr>";
						} else {
							htmlWriter += "<tr id='L" + i + "' BGCOLOR='#F4F4F4'><td colspan='6' class='cols'><table width='100%'><tr id='row'><td width='"+tdWidth[0]+"'>" + num + "</td>" + displayHTML + soldoutHTML + "<td>" + titleHtml + "</td><td>" + priceHtml + "</td><td>" + alinkHtml + "</td></tr>"+remarkHTML +"</table></td></tr>";
						}
					});
					console.log(routecode);
					htmlWriter += "</tbody></table></div>";
					htmlWriter += "<div id='loading_unit'><h1>正在保存...</h1><p></p><h2>如长时间无响应，请刷新页面重新保存</h2></div><div id='botSave'><input name='submit' type='button' value='一键保存' id='oneKeySave' class='submit'><button id='createBtn' class='createBtn'>生成静态页面</button></div>";
					$body.html(htmlWriter);
					$('#tableHead').fixedObject({floatContent:$('#dataintable')});
					function headWidth(){
						$('#tableHead').find('dt').each(function(i,e){
							var width=parseInt($('#row td:eq('+i+')').outerWidth());
							if(i==0){
							$(e).css('width',width+1);}
							else if(i>0&&i<4){
							$(e).css('width',width-1);
							}else{
							$(e).css('width',width);
							}
						});
					};
					headWidth();
					$(window).resize(function(){headWidth()});
					$("#allSelected").click(function(){
						$('.soldout[value!=Y]').each(function(i){
							var _this=$(this);
							changeCheckBox(_this);
							changeRecorde(_this);
							_this.parent().addClass('blur'+i+' edited').css("background-color","#FFC").attr("blur",i);
							_this.attr("checked",true);
						});
						//console.log(ArarryEditor);
					});
					$("#deSelected").click(function(){
						$('.soldout').each(function(i){
							var _this=$(this);
							_this.parent().addClass('blur'+i+' edited').css("background-color","#FFC").attr("blur",i);							
							this.checked=!this.checked;
							changeCheckBox(_this);
							changeRecorde(_this);
						});
						//console.log(ArarryEditor);
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
						$('#loading_unit p').html("<img src='/subject/edit/images/loading_bar.gif' />");
						var result=[0,0];//成败结果
						$('#loading_unit').fadeIn('normal');
						$(".edited,.editZoom").css("background-color","").attr("blur","-1");
						for(i=0;i<ArarryEditor.length;i++){
							savePreferences(i,result);
						}
						icount=-1;
						ArarryEditor=[];//清空数组，释放缓存
						setTimeout("$('#loading_unit').fadeOut(500)",3800);
					});
					//发送保存数据到服务器端处理
					function savePreferences(i,result){
						var dataObject={};
						if(ArarryEditor[i].index!=5){
							dataObject={//一般输入框
								line : ArarryEditor[i].line,
								index : ArarryEditor[i].index,
								value : encodeURI(ArarryEditor[i].value.filter()),
								path : adress
							}
						}else{
							dataObject={//备注框
								line : ArarryEditor[i].line,
								index : ArarryEditor[i].index,
								value : encodeURI(ArarryEditor[i].value.filter()),
								remark : ArarryEditor[i].remark,	
								path : adress
							}
						}
						$.ajax({
							data : dataObject,
							type : "POST",
							url : 'edit.ashx',
							timeout : 20000,
							async:false,//设置为同步，必须等待服务器返回结果后才继续执行,这个很重要
							error : function (XMLHttpRequest, strError, strObject) {
								result[1]++;
								$(".blur"+i).css("background-color","#FCC").removeClass("blur"+i);
							},
							success : function (strValue) {
								$('#loading_unit .progress').hide();
								if (strValue == "True") {
									result[0]++;
									$(".blur"+i).css("background-color","#CFC").removeClass("blur"+i);
								} else {
									result[1]++;
									$(".blur"+i).css("background-color","#F96").removeClass("blur"+i);
								}
							},
							complete:function (){
								$('#loading_unit h1').text("保存结果");
								if(!result[1]){
									$('#loading_unit p').html("<img src='/subject/edit/images/onebit_34.png' />");
								}else{
									$('#loading_unit p').html("<img src='/subject/edit/images/onebit_33.png' />");
								}
								$('#loading_unit h2').html("修改项目："+ArarryEditor.length+"项；成功："+result[0]+"项；失败："+result[1]+"项！");
								if(ArarryEditor.length==(i+1))
								$('#loading_unit .progress').fadeOut(1000);
							}
						});
					}
					//设置获得焦点的editZoom（编辑区）变色并记录到数组中
					var icount=-1;
					$(".inputType").blur(function(){
						var $this=$(this);
						changeRecorde($this);
						$this.css("background-color","#FFC").attr("blur",icount).addClass("blur"+icount);
						//console.log(icount);
					});
					$(".checkType").click(function(){
						var $this=$(this);
						changeRecorde($this);
						$this.attr("blur",icount).parent().css("background-color","#FFC").attr("blur",icount).addClass("blur"+icount).addClass("edited");
					});
					//获取记录数据，添加到数组，显示保存按钮
					function changeRecorde($this){
						if(!$this.attr("blur")||$this.attr("blur")=="-1"){
							if($this.attr("id")!="remark"){
								ArarryEditor.push({line:$this.attr("edit-line"),index:$this.attr("edit-index"),value:$this.val()});
							}else{
								ArarryEditor.push({line:$this.attr("edit-line"),index:$this.attr("edit-index"),remark:$this.attr("edit-remark"),value:$this.val()});
							}
							icount++;
						}else{
							var tg=Number($this.attr("blur"));
							//console.log(ArarryEditor[tg]);
							ArarryEditor[tg].value=$this.val();
						}
						$("#botSave").stop().animate({"bottom":0},600);
					};
					$body.find('#createBtn').click(function () {
						creatStaticFiles();
					});
					//生成静态htm文件
					function creatStaticFiles(){
						$('#loading_unit p').html("<img src='/subject/edit/images/loading_bar.gif' />");
						$.ajax({
							data : {path:adress},
							type : "POST",
							url : 'create.ashx',
							timeout : 50000,
							async:false,
							error : function (XMLHttpRequest, strError, strObject) {
								showFailure(strObject);
							},
							success : function (strValue) {
								if (/True/.test(strValue)&&!/False/.test(strValue)) {
									showSuccess();
									setTimeout("$('#loading_unit').fadeOut(500)",3800);
								} else {
									showFailure(strValue);
								}
							},
							complete:function(){
								showResult();
							}
						});
						$("#botSave").stop().animate({"bottom":-85},600);
					};
					//拖动上传html文件
					$("#upLoader").html5Uploader({
						name: "File",
						postUrl: 'upload.ashx',
						onSuccess:function(){
							$.ajax({
								type:'POST',
								url:'upload.ashx',
								timeout : 50000,
								data:{
									'cmd': 'moveFile',
									'url': '/subject/' + adress + '/templates/'
								},
								async: false,
								success:function(strValue){
									if (/True/.test(strValue)&&!/False/.test(strValue)) {
										creatStaticFiles();
									} else {
										showFailure(strValue);
									}
								},
								error:function(XMLHttpRequest, strError, strObject){
									showFailure(strObject);
								},
								complete:function(){
									showResult();
								}
							});
						}
					});
					function showSuccess(){
						$('#loading_unit p').html("<img src='/subject/edit/images/onebit_34.png' />");
						$('#loading_unit h2').html("操作成功！");
						$('#loading_unit').fadeIn('normal');
					};
					function showFailure(exp){
						$('#loading_unit p').html("<img src='/subject/edit/images/onebit_33.png' />");
						$('#loading_unit h2').html("操作失败！详细情况："+exp);
						$('#loading_unit').fadeIn('normal');					
					};
					function showResult(){
						$('#loading_unit h1').text("保存结果");
						$('#loading_unit .progress').fadeOut(1000);
					}
					if(getURL(1)!=null){
						var top=$('tr#L'+getURL(1)).offset().top-30;
						$('html,body').animate({scrollTop:top},300);
					}
				}
			});
		}
	}
});