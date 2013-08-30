var incendant_lid = "DEFAULT";
var titleString = "Health Library";
var useBriefVideo = true;
var INCENDANT_OFFLINE = false;

if (window.location.origin == "file://" || window.location.hostname == "localhost") {
	//We are local
	INCENDANT_OFFLINE = true;
}

var setupPCScrollbar = function(container){
    var isMobile = (navigator.appVersion.toLowerCase().indexOf("mobile") > -1 || navigator.appVersion.toLowerCase().indexOf("ipad") > -1);
    //var isMobile = false;
    if(!isMobile){
        if(container.isXType('selectfield'))container = container.down('list');// Add support for selectbuttons
        if(!Ext.isFunction(container.getScrollable) || !container.getScrollable() || !Ext.isFunction(container.getScrollable().getScroller))return console.warn("Attempting to apply pc scroller to non-container item");
        container.getScrollable().getScroller().setDisabled(true);
        var scrollContainers = Ext.DomQuery.select('.x-scroll-container', container.element.dom);
        var scrollBars = Ext.DomQuery.select('.x-scroll-indicator', container.element.dom);
        for(var i=0;i<scrollContainers.length;i++)
            scrollContainers[i].style.overflow = "auto";
        for(var i=0;i<scrollBars.length;i++)
            scrollBars[i].style.zIndex = "-1";
    }
}

if (INCENDANT_OFFLINE) {
	var BASE_URL = "http://portal.incendant.com/HealthLibrary/index.php";
} else {
	//var BASE_URL = "../";
}

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    	// If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    	// If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    	// If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
} ();

var setupIncendantLid = function() {
    if (QueryString.lid) {
        incendant_lid = QueryString.lid;
    }
    if (QueryString.titleString) {
        titleString = decodeURIComponent(QueryString.titleString);
        //console.log("QueryString.titleString="+titleString);
    }
    if (QueryString.brief) {
        useBriefVideo = QueryString.brief=='true';
        //console.log("QueryString.titleString="+titleString);
    }
}

var getIncendantLid = function() {
    return incendant_lid;
}

var getIncendantTitleString = function() {
    return titleString;
}

var incendant_vid = null;
var lastVisitAccess = 0;

var getIncendantVisitId = function() {
    var tenMinsAgo = new Date().getTime() - 600000;
    if (!incendant_vid || lastVisitAccess < tenMinsAgo) {
        //Can't use the current visit id
        incendant_vid = registerIncendantVisit();
        console.log ("New Incendant Visit Id: "+incendant_vid);
    }
    lastVisitAccess = new Date().getTime();
    return incendant_vid;
}

//Returns the visitId or null
var registerIncendantVisit = function() {
    var visit_id = null;
    //Register the visit with sync call to server
    var oReq = new XMLHttpRequest();
	oReq.open("get", BASE_URL+"?option=com_articlevideo&task=visitRegistration&lid="+getIncendantLid(), false);
	oReq.send();

	if (oReq.status === 200 && oReq.responseText && oReq.responseText != "DEFAULT") {
    	//Success
    	var xmlDoc = oReq.responseXML;
        visit_id = xmlDoc.getElementsByTagName('VisitId')[0].firstChild.nodeValue;
    } else {
        //could not register visit
        visit_id = null;
    }

    return visit_id;
}

//Returns the visitId or null
var addIncendantVideoVisit = function(articleId) {
    var visit_id = getIncendantVisitId();
    //Register the visit with sync call to server
    var oReq = new XMLHttpRequest();
	oReq.open("get", BASE_URL+"?option=com_articlevideo&task=visitupdate.update"+
              "&visitId="+visit_id+
              "&articleId="+articleId+
              "&lid="+getIncendantLid(), false);
	oReq.send();

	if (oReq.status === 200 && oReq.responseText && oReq.responseText != "DEFAULT") {
    	//Success
    	var xmlDoc = oReq.responseXML;
        if (xmlDoc.getElementsByTagName('status')[0].firstChild.nodeValue == "success") {
            console.log("Added Article "+articleId+" to visit "+visit_id);
        } else {
            console.log("Failed to add Article "+articleId+" to visit "+visit_id);
        }
    } else {
        //could not register visit
        console.log("Could not add Article "+articleId+" to visit "+visit_id);

    }
}

//Returns the visitId or null
var updatePatientInfo = function(email) {
    var visit_id = getIncendantVisitId();
    //Register the visit with sync call to server
    var oReq = new XMLHttpRequest();
	oReq.open("get", BASE_URL+"?option=com_users&task=registration.savePatient"+
              "&name="+encodeURIComponent(email)+
              "&email="+encodeURIComponent(email)+
              "&sendEmail=1"+
              "&visitId="+visit_id, false);
	oReq.send();

	if (oReq.status === 200 && oReq.responseText && oReq.responseText != "DEFAULT") {
    	//Success
    	var xmlDoc = oReq.responseXML;
        if (xmlDoc.getElementsByTagName('status')[0].firstChild.nodeValue == "success") {
            console.log("Updated patient "+email+" on visit "+visit_id);
        } else {
            console.log("Failed to update patient "+email+" on visit "+visit_id);
        }
    } else {
        //could not register visit
        console.log("Could not update patient "+email+" on visit "+visit_id);

    }
}

//Returns the Images List
var getVideos = function() {
    var videos = null;
    //Get the Videos as JSON
    var oReq = new XMLHttpRequest();
    oReq.open("get", BASE_URL+"?option=com_articlevideo&task=jsonresponce.topicJSON&lang=en&lid="+getIncendantLid(), false);
	oReq.send();

	if (oReq.status === 200 && oReq.responseText && oReq.responseText != "DEFAULT") {
    	//Success
    	videos = JSON.parse(oReq.responseText);
    } else {
        //could not register visit
        console.log("Could not retrieve list of videos from the server!");
    }

    return videos;
}

//Returns the Images List
var getImages = function() {
    var images = null;
    //Get the Videos as JSON
    var oReq = new XMLHttpRequest();
    oReq.open("get", BASE_URL+"?option=com_illustrations&task=imageJSON&lang=en&lid="+getIncendantLid(), false);
	oReq.send();

	if (oReq.status === 200 && oReq.responseText && oReq.responseText != "DEFAULT") {
    	//Success
    	images = JSON.parse(oReq.responseText);
    } else {
        //could not register visit
        console.log("Could not retrieve list of videos from the server!");
    }

    return images;
}


