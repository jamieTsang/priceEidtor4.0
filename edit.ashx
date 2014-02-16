<%@ WebHandler Language="C#" Class="edit"%>
//修改xml主程序 v4.1.4
using System;
using System.Collections.Generic;
using System.Web;
using System.Linq;
using System.Xml.Linq;
using System.Text;
using System.Web.SessionState;
using System.Xml;
using System.IO;

public class edit : IHttpHandler , IReadOnlySessionState{
    
    public void ProcessRequest (HttpContext context) {
        context.Request.ContentEncoding = Encoding.GetEncoding("utf-8");
        context.Response.ContentEncoding = Encoding.GetEncoding("utf-8");
        string strId = context.Request.Form["line"];
        string index = context.Request.Form["index"];
        string value = context.Server.UrlDecode(context.Request.Form["value"]);
        string para = context.Request.Form["path"];
        string xmlPath = "/subject/" + para + "/scripts/data.xml";
        string remark = context.Request.Form["remark"];
        try{
            var data = XDocument.Load(context.Server.MapPath(xmlPath));
            var lines = from l in data.Descendants("line")
                        where l.Attribute("id").Value == strId
                        select l;
            switch (index) { 
                case "0":
                    editValue(context, lines, "display", value);
                break;
                case "1":
                    editValue(context, lines, "soldout", value);
                break;
                case "2":
                    editValue(context, lines, "title", value);
                break;
                case "3":
                    editValue(context, lines, "price", value);
                break;
                case "4":
                    editValue(context, lines, "link", value);
                break;
                case "5":
                    editRemarkValue(context, lines, remark, value);
                break;
                default:
                    context.Response.Write("False");
                break;
            }
            string strIdentify = context.Session["isLogin"].ToString();
            if (strIdentify == "identified")
            {
                data.Save(context.Server.MapPath(xmlPath));//保存。
                context.Response.Write("True");
            }
            else
            {
                context.Response.Write("False");
            }
        }
        catch 
        {
          context.Response.Write("False");
        }
    }
    private void editValue(HttpContext context, IEnumerable<XElement> lines, string str, string value)
    {
        try
        {
            foreach (var elem in lines)
            {
                elem.Element(str).Value = value.Replace("[equal]", "=").Replace("[hyphen]", "-");
            }
        }catch{
            context.Response.Write("False");
        }
    }
    private void editRemarkValue(HttpContext context, IEnumerable<XElement> lines, string str, string value)
    {
        try
        {
            int i = int.Parse(str);
            foreach (var elem in lines)
            {
                elem.Element("remark").Element("r" + str).Value = value.Replace("[equal]", "=").Replace("[hyphen]", "-");
            }
        }
        catch{
            context.Response.Write("False");
        }
    }
    public bool IsReusable {
        get {
            return false;
        }
    }

}