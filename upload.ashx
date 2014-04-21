<%@ WebHandler Language="C#" Class="upload" %>
//上传文件主程序 v4.1.4
using System;
using System.Text.RegularExpressions;
using System.Collections;
using System.Collections.Generic;
using System.Web;
using System.Linq;
using System.Xml.Linq;
using System.Text;
using System.Web.SessionState;
using System.IO;

public class upload : IHttpHandler, IReadOnlySessionState
{
    public void ProcessRequest (HttpContext context) {
        context.Request.ContentEncoding = Encoding.GetEncoding("utf-8");
        context.Response.ContentEncoding = Encoding.GetEncoding("utf-8");
        if (context.Request.Form["cmd"] != null)
        {
            switch (context.Request.Form["cmd"].ToString())
            {
                case "moveFile":
                    String url=context.Request.Form["url"].ToString();
                    moveFile(context,url);
                break;
            }
        }
        else {
            uploadHTML(context);
        }
    }
    private void moveFile(HttpContext context,String targetFolder)
    {
        try
        {
            string tempFolder = "/subject/edit/temp/";
            DirectoryInfo folder = new DirectoryInfo(context.Server.MapPath(tempFolder));
            FileInfo[] file = folder.GetFiles("*.tpl");
            System.IO.File.Copy(file[0].FullName, context.Server.MapPath(targetFolder + System.IO.Path.GetFileName(file[0].FullName)), true);
            System.IO.File.Delete(file[0].FullName);
            context.Response.Write("True");
        }
        catch {
           context.Response.Write("在临时文件夹找不到模板文件！");
        }
    }
    private void uploadHTML(HttpContext context)
    {
        if (context.Request.RequestType == "POST")
        {
            //Response.ContentType = "text/xml";
            try
            {
                HttpPostedFile file = context.Request.Files[0];//文件
                String fileName = System.IO.Path.GetFileNameWithoutExtension(file.FileName);//文件名
                file.SaveAs(context.Server.MapPath("/subject/edit/temp/" + fileName + "_ext_" + System.IO.Path.GetExtension(file.FileName) + ".tpl"));
            }
            catch {
                context.Response.Write("存储文件失败");
            }
        }
    }
    public bool IsReusable {
        get {
            return false;
        }
    }

}