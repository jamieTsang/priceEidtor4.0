<%@ WebHandler Language="C#" Class="create" %>
//修改价格主程序 v4.1.4
using System;
using System.Text.RegularExpressions;
using System.Collections;
using System.Collections.Generic;
using System.Web;
using System.Linq;
using System.Xml.Linq;
using System.Text;
using System.Web.SessionState;
using System.Xml;
using System.IO;

public class create : IHttpHandler, IReadOnlySessionState
{
    //源码是替换掉模板中的特征字符  
    public void ProcessRequest (HttpContext context) {
        context.Request.ContentEncoding = Encoding.GetEncoding("utf-8");
        context.Response.ContentEncoding = Encoding.GetEncoding("utf-8");
        string strIdentify=null;
        /*try { strIdentify = context.Session["isLogin"].ToString(); }*/
        /*catch(Exception ex) { context.Response.Write("Error:"+ex); }*/
        string para = context.Request.Form["path"];
        StreamReader sr = null;
        StreamWriter sw = null;
        string str = null;
        Encoding code = Encoding.GetEncoding("utf-8");
        /*if (strIdentify == "identified")//判断是否登录
        {*/
            string xmlPath = "/subject/" + para + "/scripts/data.xml";
            var data = XDocument.Load(context.Server.MapPath(xmlPath));
            var lines = from l in data.Descendants("line")
                        select l;
            //打开目标模板
            /*try
            {*/
            String tplPath="";
            try { tplPath = context.Server.MapPath("/subject/" + para + "/templates/"); }
            catch (Exception ex){
                context.Response.Write("找不到templates文件夹，请新建！");
                return;
            }
                string mainPath = context.Server.MapPath("/subject/" + para + "/");
                DirectoryInfo folder = new DirectoryInfo(tplPath);
                if (folder.GetFiles("*.tpl").Length != 0)
                {
                    foreach (FileInfo file in folder.GetFiles("*.tpl"))
                    {
                        try
                        {
                            sr = new StreamReader(file.FullName, code);
                            str = sr.ReadToEnd();
                        }
                        catch (Exception ex)
                        {
                            throw ex;
                        }
                        finally
                        {
                            sr.Close();
                        }
                        //查找line内容
                        IEnumerable<XElement> remarks = null;
                        foreach (var elem in lines)
                        {
                            string isDisplay = "";
                            string isSoldOut = "";
                            string title = "";
                            string price = "";
                            string link = "";
                            string titleText = "";
                            Boolean isRemark =false;
                            int index = int.Parse(elem.Attribute("id").Value);                            
                            try
                            {
                                isDisplay = elem.Element("display").Value;
                                isSoldOut = elem.Element("soldout").Value;
                                title = getReg(elem.Element("title").Value);
                                price = elem.Element("price").Value;
                                link = elem.Element("link").Value;
                                titleText = Regex.Replace(title, @"<\w+>|</\w+>", "");
                            }
                            catch (Exception ex) {
                                string exNum = Regex.Match(ex.StackTrace, "行号\\s(?<LineNumber>\\d*)").Groups["LineNumber"].Value;
                                string exTxt = "";
                                switch (exNum)
                                {
                                    case "77": exTxt = "上架"; break;
                                    case "78": exTxt = "售罄"; break;
                                    case "79": exTxt = "标题"; break;
                                    case "80": exTxt = "价格"; break;
                                    case "81": exTxt = "链接"; break;
                                }
                                context.Response.Write("data.xml文件在id号" + index + "处,缺失必要的\"" + exTxt+"\"信息！");
                                return;
                            }
                            try
                            {
                                remarks = from rm in elem.Element("remark").Elements()
                                          select rm;
                                isRemark = true;
                            }
                            catch { }
                            //查找线路
                            string reg = @"{line#" + index + @"}\S*[-->]*([\s\S]*){/line#" + index + @"}";
                            Regex imgReplace = new Regex(@"([^-])\s*>");
                            if (isDisplay == "Y")
                            {
                                string m = Regex.Match(str, reg, RegexOptions.IgnoreCase | RegexOptions.Multiline).Groups[1].Value;
                                m = imgReplace.Replace(m, "$1><img style=\"position:absolute\" class=\"pea_img\" data-index=\"" + index + "\" src=\"/static/images/blank.gif\"/>", 1);
                                if (isSoldOut == "N")
                                {
                                    m = m.Replace("{$title}", title).Replace("{$price}", price).Replace("{$link}", link + "\" onclick=\"javascript:_gaq.push(['_trackEvent','点击事次数件统计','线路链接按钮点击','" + titleText.Replace("\"", "") + "']);").Replace("{$linkClass}", "").Replace("{$linkTarget}", "_blank").Replace("{$titleText}", titleText);
                                }
                                else
                                {
                                    m = m.Replace("{$title}", title).Replace("{$price}", price).Replace("{$link}", "javascript:void(0);").Replace("{$linkClass}", "soldOut").Replace("{$linkTarget}", "_self").Replace("{$titleText}", titleText);
                                }
                                if (isRemark)
                                {
                                    int i = 0;
                                    ArrayList remark = new ArrayList();
                                    foreach (XElement rm in remarks)
                                    {
                                        m = m.Replace("{$remark#" + i + "}", getReg(rm.Value));
                                        i++;
                                    }
                                }
                                str = Regex.Replace(str, reg, m);
                            }
                            else
                            {
                                str = Regex.Replace(str, reg, "");
                            }
                        }
                        //替换{$title}
                        string include = "";
                        StreamReader ic = null;
                        /*string RegexFootAd=@"\{$title\}";
                        var includes = Regex.Match(str,RegexFootAd);*/
                        try
                        {
                            ic = new StreamReader(context.Server.MapPath("/subject/index/header.html"), code);
                            include = ic.ReadToEnd();
                            str = str.Replace("<!-- {$header} -->", include);
                        }
                        catch (Exception ex)
                        { }
                        finally
                        {
                            ic.Close();
                        }
                        //替换{$includeFootAd}
                        /*string include="";
                        StreamReader ic = null;
                        string RegexFootAd=@"\{\$includeFootAd:(.*)#(.*)\}";
                        var includes = Regex.Match(str,RegexFootAd);
                        var includesURL = includes.Groups[1].Value;
                        var includesInfo = includes.Groups[2].Value;
                        try
                        {
                            if (includesURL != "")
                            {
                                ic = new StreamReader(context.Server.MapPath(includesURL), code);
                            }
                            else {
                                ic = new StreamReader(context.Server.MapPath("/subject/index/footad.html"), code);
                            }
                            include = ic.ReadToEnd();
                            include = include.Replace("{$footInfo}", includesInfo);
                            str = Regex.Replace(str, RegexFootAd, include);
                        }
                        catch (Exception ex)
                        {
                            throw ex;
                        }
                       finally
                        {
                           ic.Close();
                        }*/
                        //替换时间
                        var TimeNow = DateTime.Now;
                        str = str.Replace("{$update}", "本页面产品信息仅供参考，由于报名位置实时变动，最终价格以支付时为准。此页面中产品信息最后更新时间：" + TimeNow.ToLongDateString().ToString() + "&nbsp;" + (Convert.ToInt32(TimeNow.Hour) < 12 ? "上午" : "下午") + TimeNow.ToString("hh:mm"));
                        string fileName = Path.GetFileNameWithoutExtension(file.FullName) + ".htm";
                        //生成静态文件
                        try
                        {
                            sw = new StreamWriter(mainPath + fileName, false, code);
                            sw.Write(str);
                            sw.Flush();
                            context.Response.Write("True");
                        }
                        catch (Exception ex)
                        {
                            throw ex;
                        }
                        finally
                        {
                            sw.Close();
                        }
                    }
                }
                else {
                    context.Response.Write("在templates文件夹找不到任何模板文件！");
                }
            //}
        }
    //}
    private string getReg(string e)
    {
        //str = str.Replace("[br]", "<br />");
        e = e.Replace("[b]","<b>").Replace("[/b]","</b>");
        //str= str.Replace("[fs=]")
        e = e.Replace("[br]", "<br>");
        return e;
    }
    public bool IsReusable {
        get {
            return false;
        }
    }

}