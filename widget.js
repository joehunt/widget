var INCENDANT_WIDGET_BASE = "http://portal.incendant.com/HealthLibrary/new/";

var oReq = new XMLHttpRequest();
oReq.open("get", INCENDANT_WIDGET_BASE+"validWidgetDomain.php?domain="+document.location.host, false);
oReq.send();

var lid = 'DEFAULT';

var widgets = document.querySelectorAll(".incendant-widget");

if (oReq.status === 200 && oReq.responseText && oReq.responseText != "DEFAULT") {
    //Success
    lid = oReq.responseText;

    for (var i = 0; i < widgets.length; ++i) {
        var item = widgets[i];
        
        var iframe = document.createElement('iframe');
        var scheme = (item.getAttribute('scheme'))?item.getAttribute('scheme'):"";
        var redirect = item.getAttribute('redirect');
        var titleString = (item.getAttribute('titleString'))?item.getAttribute('titleString'):"";
        
        var iframeSrc = INCENDANT_WIDGET_BASE+'?lid='+lid+"&titleString="+encodeURIComponent(titleString);
        if (scheme && scheme.length) {
            iframeSrc = iframeSrc + '&scheme='+scheme;
        }
        var brief = item.getAttribute('brief');
        
        if (brief && brief.length) {
            iframeSrc = iframeSrc + '&brief='+brief;
        }
        //alert(navigator.userAgent);
        
        var isMobile = (navigator.appVersion.toLowerCase().indexOf("mobile") > -1
                        || navigator.appVersion.toLowerCase().indexOf("ipad") > -1
                        || navigator.userAgent.toLowerCase().indexOf("android") > -1);
        //console.log("isMobile: "+isMobile+ "redirect: "+redirect);
        if (isMobile && redirect) {
            alert("Redirecting to mobile site");
            window.location.href=iframeSrc;
        } else {
            iframe.src = iframeSrc;
            iframe.width = item.getAttribute('width');
            iframe.height = item.getAttribute('height');
            iframe.setAttribute('frameborder','0');
            iframe.setAttribute('class','incendant_iframe');
            //document.insertBefore(iframe,item);
            item.parentNode.replaceChild(iframe,item);
        }
        
    }
} else {
    for (var i = 0; i < widgets.length; ++i) {
        var item = widgets[i];
        //Do something Dramatic!
        var iframe = document.createElement('iframe');
        iframe.src = INCENDANT_WIDGET_BASE+"invalidWidget.php?domain="+document.location.host;
        iframe.width = item.getAttribute('width');
        iframe.height = item.getAttribute('height');
        iframe.setAttribute('frameborder','0');
        iframe.setAttribute('class','incendant_iframe');
        //document.insertBefore(iframe,item);
        item.parentNode.replaceChild(iframe,item);
    }
}

console.log('widget lid:'+lid);
console.log('host:'+document.location.host);
console.log('hostname:'+document.location.hostname);




