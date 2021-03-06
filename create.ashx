﻿<%@ WebHandler Language="C#" Class="create" %>
//修改价格主程序 v4.3.6
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

public class EncodingType
//判断编码
//如果文件有BOM则判断，如果没有就用系统默认编码，缺点：没有BOM的非系统编码文件会显示乱码。   
//调用方法： EncodingType.GetType(filename)   
//来源：http://blog.csdn.net/listlofusage/archive/2007/02/10/1506900.aspx   
{
    public static System.Text.Encoding GetType(string FILE_NAME)
    {
        FileStream fs = new FileStream(FILE_NAME, FileMode.Open, FileAccess.Read);
        System.Text.Encoding r = GetType(fs);
        fs.Close();
        return r;
    }
    public static System.Text.Encoding GetType(FileStream fs)
    {
        /*byte[] Unicode=new byte[]{0xFF,0xFE};  
        byte[] UnicodeBIG=new byte[]{0xFE,0xFF};  
        byte[] UTF8=new byte[]{0xEF,0xBB,0xBF};*/

        BinaryReader r = new BinaryReader(fs, System.Text.Encoding.Default);
        byte[] ss = r.ReadBytes(3);
        r.Close();
        //编码类型 Coding=编码类型.ASCII;   
        if (ss[0] >= 0xEF)
        {
            if (ss[0] == 0xEF && ss[1] == 0xBB && ss[2] == 0xBF)
            {
                return System.Text.Encoding.UTF8;
            }
            else if (ss[0] == 0xFE && ss[1] == 0xFF)
            {
                return System.Text.Encoding.BigEndianUnicode;
            }
            else if (ss[0] == 0xFF && ss[1] == 0xFE)
            {
                return System.Text.Encoding.Unicode;
            }
            else
            {
                return System.Text.Encoding.Default;
            }
        }
        else
        {
            return System.Text.Encoding.Default;
        }
    }
}

public class create : IHttpHandler, IReadOnlySessionState
{
    //源码是替换掉模板中的特征字符  
    public void ProcessRequest(HttpContext context)
    {
        context.Request.ContentEncoding = Encoding.GetEncoding("utf-8");
        context.Response.ContentEncoding = Encoding.GetEncoding("utf-8");
        /*try { strIdentify = context.Session["isLogin"].ToString(); }*/
        /*catch(Exception ex) { context.Response.Write("Error:"+ex); }*/
        string para = context.Request.Form["path"];
        StreamReader sr = null;
        StreamWriter sw = null;
        string str = null;
        Boolean isStats = false;
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
        String tplPath = "";
        try { tplPath = context.Server.MapPath("/subject/" + para + "/templates/"); }
        catch (Exception ex)
        {
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
                    sr = new StreamReader(file.FullName, EncodingType.GetType(file.FullName));
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
                    Boolean isRemark = false;
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
                    catch (Exception ex)
                    {
                        string exNum = Regex.Match(ex.StackTrace, "行号\\s(?<LineNumber>\\d*)").Groups["LineNumber"].Value;
                        string exTxt = "";
                        switch (exNum)
                        {
                            case "127": exTxt = "上架"; break;
                            case "128": exTxt = "售罄"; break;
                            case "129": exTxt = "标题"; break;
                            case "130": exTxt = "价格"; break;
                            case "131": exTxt = "链接"; break;
                        }
                        context.Response.Write("data.xml文件在id号" + index + "处,缺失必要的\"" + exTxt + "\"信息！");
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
                    //string reg = @"(?s){line#" + index + @"}\S*[-->]*(.*?)[<!--]*{/line#*\d*}";
                    //string reg = @"(?s)(?<={line#" + index + @"}).*?(?={/line#*\d*})";
                    string reg = @"(?s)<!-{2}\s*{line#" + index + @"}.*?{/line#*\d*}\s*-{2}>";
                    Regex imgReplace = new Regex(@"([^-])\s*>");
                    if (isDisplay == "Y")
                    {
                        MatchCollection MatchLines = Regex.Matches(str, reg, RegexOptions.IgnoreCase | RegexOptions.Multiline);
                        var newCode = "";
                        for (int ctr = 0; ctr < MatchLines.Count; ctr++)
                        {
                            newCode = MatchLines[ctr].Value;
                            newCode = imgReplace.Replace(newCode, "$1><img style=\"position:absolute\" class=\"pea_img\" data-index=\"" + index + "\" src=\"/static/images/blank.gif\"/>", 1);
                            newCode = Regex.Replace(newCode, @"<!-{2}\s*{line#\d+}\s*-{2}>", "");
                            newCode = Regex.Replace(newCode, @"<!-{2}\s*{/line#*\d*}\s*-{2}>", "");
                            newCode = newCode.Replace("{$title}", title);
                            if (isSoldOut == "N")
                            {
                                newCode = newCode.Replace("{$title}", title).Replace("{$price}", price).Replace("{$link}", link + "\" onclick=\"javascript:_gaq.push(['_trackEvent','点击事次数件统计','线路链接按钮点击','" + titleText.Replace("\"", "") + "']);").Replace("{$linkClass}", "").Replace("{$linkTarget}", "_blank").Replace("{$titleText}", titleText).Replace("{$linkValue}", link);
                            }
                            else
                            {
                                newCode = newCode.Replace("{$title}", title).Replace("{$price}", price).Replace("{$link}", "javascript:void(0);").Replace("{$linkClass}", "soldOut").Replace("{$linkTarget}", "_self").Replace("{$titleText}", titleText).Replace("{$linkValue}", link);
                            }
                            if (isRemark)
                            {
                                int i = 0;
                                ArrayList remark = new ArrayList();
                                foreach (XElement rm in remarks)
                                {
                                    newCode = newCode.Replace("{$remark#" + i + "}", getReg(rm.Value));
                                    i++;
                                }
                            }
                            //str = Regex.Replace(str, reg, m, RegexOptions.IgnoreCase | RegexOptions.Multiline);
                            //str = Regex.Replace(str, reg, "$1"+title+"$2", RegexOptions.IgnoreCase | RegexOptions.Multiline);
                            str = str.Replace(MatchLines[ctr].Value, newCode);
                        }
                    }
                    else
                    {
                        str = Regex.Replace(str, reg, "");
                    }
                }
                //替换{$title}
                string include = "";
                StreamReader ic = null;
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
                /*统计代码*/
                StreamReader stats = null;
                string pat = @"<!-- \{\$stats#?([A-Za-z]*)\} -->";
                string patHead = @"<!-- \{\$stats";
                string hash = "#";
                string stats_addres;
                string stats_include;
                string stats_name;
                /*try
                {*/
                    //Boolean regexResult=Regex.IsMatch(str,pat,RegexOptions.IgnoreCase);
                    MatchCollection MatchStats = Regex.Matches(str, pat, RegexOptions.IgnoreCase | RegexOptions.Multiline);
                    for (int statsIndex = 0; statsIndex < MatchStats.Count; statsIndex++)
                    {
                        if (MatchStats[statsIndex].Success)
                        {
                            Regex stats_reg = new Regex(pat);
                            stats_name = stats_reg.Match(str).Groups[1].Value;
                            if (!String.IsNullOrEmpty(stats_name) && stats_name == "dsp")
                            {
                                stats_addres = "/subject/index/stats_dsp.html";
                            }
                            else if (!String.IsNullOrEmpty(stats_name) && stats_name == "google")
                            {
                                stats_addres = "/subject/index/stats_google.html";
                            }
                            else
                            {
                                stats_addres = "/subject/index/stats.html";
                                hash = "";
                                if (stats_reg.Match(str).Groups[0].Value == "<!-- {$stats} -->")
                                {
                                    isStats=true;
                                }
                            }
                            stats = new StreamReader(context.Server.MapPath(stats_addres), code);
                            stats_include = stats.ReadToEnd();

                            str = Regex.Replace(str, patHead + hash + stats_name + @"\} -->", delegate(Match m) { return stats_include; });
                        }
                        
                    }
                    
                    
                /*}
                catch (Exception ex)
                { }
                finally
                {
                    stats.Close();
                }*/
                //替换时间
                var TimeNow = DateTime.Now;
                str = str.Replace("{$update}", "本页面产品信息仅供参考，由于报名位置实时变动，最终价格以支付时为准。此页面中产品信息最后更新时间：" + TimeNow.ToLongDateString().ToString() + "&nbsp;" + (Convert.ToInt32(TimeNow.Hour) < 12 ? "上午" : "下午") + TimeNow.ToString("hh:mm"));
                string fileName = Path.GetFileNameWithoutExtension(file.FullName);
                string fileNameReg = @"(\S+)_ext_(\S+)";
                if (Regex.IsMatch(fileName, fileNameReg, RegexOptions.IgnoreCase))
                {
                    string realFileName = Regex.Match(fileName, fileNameReg, RegexOptions.IgnoreCase).Groups[1].Value;
                    string realExt = Regex.Match(fileName, fileNameReg, RegexOptions.IgnoreCase).Groups[2].Value;
                    fileName = realFileName + ((realExt == ".html") ? ".htm" : realExt);
                }
                else
                {
                    fileName += ".htm";
                }
                //生成静态文件
                try
                {
                    sw = new StreamWriter(mainPath + fileName, false, code);
                    sw.Write(str);
                    sw.Flush();
                    if (!isStats)
                    {
                        context.Response.Write("True(x0001)_file=" + fileName);
                    }
                    else
                    {
                        context.Response.Write("True" + isStats);
                    }
                    
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
        else
        {
            context.Response.Write("在templates文件夹找不到任何模板文件！");
        }
        //}
    }
    //}
    private string getReg(string e)
    {
        //str = str.Replace("[br]", "<br />");
        e = e.Replace("[b]", "<b>").Replace("[/b]", "</b>");
        //str= str.Replace("[fs=]")
        e = e.Replace("[br]", "<br>");
        return e;
    }
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}