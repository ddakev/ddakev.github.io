/*
To-dos:
- on mobile, on swipe from right to left, if menu is open, collapse

*/
var rep;
var curScrn=0;
var scrStep=0;
var scrollPosition=0;
var lScrnHeight;
var lScrnWidth;
var slideNames=["home","about","projects","contact","copyright"];
var visited=[0,0,0,0];

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function init()
{
    lScrnHeight = window.innerHeight;
    lScrnWidth = window.innerWidth;
    var content=document.getElementById("contentPage");
    var page = window.location.href.split("?p=");
    if(page.length>1) {
      content.scrollTop = parseFloat(document.getElementById(page[1]).offsetTop);
    }
    scrollPosition=content.scrollTop;
    var scrollFactor=3*Math.abs(content.scrollTop)/parseFloat(window.getComputedStyle(document.getElementById("contact")).top);
    document.getElementById("pageSelectorClip").style.top=(3+scrollFactor*21) + "px";
    document.getElementById("pageSelectorButtons").style.top=(-3-scrollFactor*21) + "px";
    updateCurrentScreen(findScreen());
    initEvents();
    if(!document.getElementById("downarr").contentDocument.getElementById("expand").beginElement) {
        document.getElementById("downarr").data="graphics/downarrow.svg";
    }
    document.getElementById("scrollHintWrapper").style.bottom="5vh";
    setTimeout('startAnims()',1000);
    if(navigator.userAgent.indexOf("Firefox")!=-1)
    {
        document.getElementById("downarr").contentDocument.getElementById("expand").setAttribute("keySplines",".48 .34 .82 .67; .34 .44 .87 1");
    }
}
function initEvents()
{
    if(window.innerWidth>640) {
        document.getElementById("logo").addEventListener("mouseover", expandName);
        document.getElementById("logo").addEventListener("mouseout", hideName);
    }

    window.addEventListener("resize", scrollPg);
    document.getElementById("contentPage").addEventListener("scroll",scrollPg);
    document.getElementById("hamMenu").addEventListener("click",checkboxChange);
    document.getElementById("contentPage").addEventListener("click",checkToCollapse);

    var mItems=document.getElementsByClassName("menuItem");
    for(var i=0; i<mItems.length; i++)
    {
        mItems[i].addEventListener("click",function(e) {collapseMenu();});
        mItems[i].children[0].addEventListener("mouseenter",function(event){event.target.style.backgroundColor="rgba(65,64,66,0.6)";});
        mItems[i].children[0].addEventListener("mouseout",function(event){if(event.target != document.getElementsByClassName("menuItem")[curScrn].children[0]) event.target.style.backgroundColor="rgba(65,64,66,0.0)";});
    }

    var ta = document.getElementsByTagName("textarea")[0];
    ta.addEventListener("mouseover", function(e) {
        ta.style.borderBottomColor="rgba(0,130,200,0.5)";
        ta.style.backgroundColor="rgba(190,190,190,0.1)";
    });
    ta.addEventListener("mouseout", function(e) {
        if(ta !== document.activeElement) {
            ta.style.borderBottomColor="rgba(65,64,66,0.5)";
            ta.style.backgroundColor="rgba(190,190,190,0.0)";
        }
    });
    ta.addEventListener("focus", function(e) {
        ta.style.borderBottomColor="rgba(0,130,200,1)";
        ta.className += " selected";
        ta.style.backgroundColor="rgba(190,190,190,0.2)";
    });
    ta.addEventListener("blur", function(e) {
        ta.style.borderBottomColor="rgba(65,64,66,0.5)";
        ta.className = "";
        ta.style.backgroundColor="rgba(190,190,190,0.0)";
        if(ta.value=="") {
            ta.parentElement.getElementsByClassName("notification")[2].style.visibility="visible";
            ta.parentElement.getElementsByClassName("notArrow")[2].style.visibility="visible";
            ta.parentElement.getElementsByClassName("notification")[2].style.maxWidth="300px";
        }
        else {
            ta.parentElement.getElementsByClassName("notification")[2].style.maxWidth="0px";
            setTimeout(function() {ta.parentElement.getElementsByClassName("notification")[2].style.visibility="hidden"; ta.parentElement.getElementsByClassName("notArrow")[2].style.visibility="hidden";},200);
        }
    });

    Array.prototype.forEach.call(document.getElementsByTagName("input"), function(inp) {
        if(inp.getAttribute("type")=="text") {
            inp.addEventListener("focus", function(i) {
                inp.parentNode.getElementsByClassName("cLabel")[0].style.fontSize="8pt"; inp.parentNode.getElementsByClassName("cLabel")[0].style.marginTop="0";
                inp.parentNode.getElementsByClassName("cLabel")[0].style.color="rgba(0,130,200,1)";
                inp.style.backgroundColor="rgba(190,190,190,0.2)";
                inp.style.borderBottomColor="rgba(0,130,200,1)";
            });
            inp.addEventListener("blur", function(i) {
                inp.style.backgroundColor="rgba(190,190,190,0.0)";
                inp.style.borderBottomColor="rgba(65,64,66,0.5)";
                inp.parentNode.getElementsByClassName("cLabel")[0].style.color="rgba(0,130,200,0.7)";

                if(inp.value=="") {
                    if(inp.name=="email") {
                        inp.parentElement.getElementsByClassName("notification")[0].innerHTML="Please provide an email address";
                    }
                    inp.parentNode.getElementsByClassName("cLabel")[0].style.fontSize="12pt";
                    inp.parentNode.getElementsByClassName("cLabel")[0].style.marginTop="10px";
                    inp.parentElement.getElementsByClassName("notification")[0].style.visibility="visible";
                    inp.parentElement.getElementsByClassName("notification")[0].style.maxWidth="300px";
                    inp.parentElement.getElementsByClassName("notArrow")[0].style.visibility="visible";
                }
                else {
                    if(inp.name=="email"&&!validate(inp.value)) {
                        inp.parentElement.getElementsByClassName("notification")[0].innerHTML="Please provide a valid email";
                        inp.parentElement.getElementsByClassName("notification")[0].style.visibility="visible";
                        inp.parentElement.getElementsByClassName("notification")[0].style.maxWidth="300px";
                        inp.parentElement.getElementsByClassName("notArrow")[0].style.visibility="visible";
                    }
                    else {
                        inp.parentElement.getElementsByClassName("notification")[0].style.maxWidth="0px";
                        setTimeout(function() {inp.parentElement.getElementsByClassName("notification")[0].style.visibility="hidden"; inp.parentElement.getElementsByClassName("notArrow")[0].style.visibility="hidden";},200);
                    }
                }
            });
            inp.addEventListener("mouseover", function(e) {
                inp.style.backgroundColor="rgba(190,190,190,0.1)";
                inp.style.borderBottomColor="rgba(0,130,200,0.5)";
            });
            inp.addEventListener("mouseout", function(e) {
                if(inp !== document.activeElement) {
                    inp.style.backgroundColor="rgba(190,190,190,0.0)";
                    inp.style.borderBottomColor="rgba(65,64,66,0.5)";
                }
            });
        }
    });

    document.getElementById("cForm").addEventListener("submit", function(e) {
        var valid = true;
        Array.prototype.forEach.call(document.getElementsByTagName("input"), function(inp) {
            if(inp.value == "") {
                valid = false;
                inp.parentElement.getElementsByClassName("notification")[0].style.visibility="visible";
                inp.parentElement.getElementsByClassName("notification")[0].style.maxWidth="300px";
                inp.parentElement.getElementsByClassName("notArrow")[0].style.visibility="visible";
            }
            else if(inp.name=="email" && !validate(inp.value)) {
                valid=false;
                inp.parentElement.getElementsByClassName("notification")[0].innerHTML="Please provide a valid email";
                inp.parentElement.getElementsByClassName("notification")[0].style.visibility="visible";
                inp.parentElement.getElementsByClassName("notification")[0].style.maxWidth="300px";
                inp.parentElement.getElementsByClassName("notArrow")[0].style.visibility="visible";
            }
        });
        var ta=document.getElementsByTagName("textarea")[0];
        if(ta.value=="") {
            valid=false;
            ta.parentElement.getElementsByClassName("notification")[2].style.visibility="visible";
            ta.parentElement.getElementsByClassName("notArrow")[2].style.visibility="visible";
            ta.parentElement.getElementsByClassName("notification")[2].style.maxWidth="300px";
        }
        if(valid == false && e.preventDefault) {
            e.preventDefault();
        }
        return valid;

    });
}
function updateCurrentScreen(scr)
{
    var stateObj = {a: "b"};
    history.replaceState(stateObj, slideNames[scr].capitalize(), "?p="+slideNames[scr]);
    document.title=slideNames[scr].capitalize() + " - Daniel Dakev";

    if(window.getComputedStyle(document.getElementById("hamMenuLabel")).display=="none")
    {
        document.getElementsByTagName("li")[curScrn].style.backgroundColor="rgba(65,64,66,0.0)";
        document.getElementsByTagName("li")[curScrn].style.boxShadow="inset 0px 0px 6px -1px rgba(31,30,32,0)";
        document.getElementsByTagName("li")[scr].style.backgroundColor="rgba(65,64,66,0.6)";
        document.getElementsByTagName("li")[scr].style.boxShadow="inset 0px 0px 6px -1px rgba(31,30,32,0.6)";
    }

    if(scr == 1 && visited[scr] == 0) {
        animatePie("bl-cpp",0.95);
        animatePie("bl-java",0.85);
        animatePie("bl-csharp",0.75);
        animatePie("bl-javascript",0.8);
        animatePie("bl-html",0.65);
        animatePie("bl-css",0.7);
    }

    document.getElementById("pageSelectorClip").style.top=(3+scr*21) + "px";
    document.getElementById("pageSelectorButtons").style.top=(-3-scr*21) + "px";

    visited[scr] = 1;
    curScrn=scr;
}
function findScreen()
{
    var content=document.getElementById("contentPage");
    var pos=Math.abs(content.scrollTop);
    var dist0=Math.abs(pos-parseFloat(document.getElementById(slideNames[0]).offsetTop));
    var dist1=Math.abs(pos-parseFloat(document.getElementById(slideNames[1]).offsetTop));
    var dist2=Math.abs(pos-parseFloat(document.getElementById(slideNames[2]).offsetTop));
    var dist3=Math.abs(pos-parseFloat(document.getElementById(slideNames[3]).offsetTop));
    var mindist=Math.min(Math.min(dist0,dist1),Math.min(dist2,dist3));
    if(mindist == dist0) return 0;
    else if(mindist == dist1) return 1;
    else if(mindist == dist2) return 2;
    else if(mindist == dist3) return 3;
}
function scroll(spos,fpos,steps)
{
    var content=document.getElementById("contentPage");
    if(scrStep==steps)
    {
        clearInterval(rep);
        rep=false;
        return;
    }
    scrStep++;
    content.scrollTop=Math.round(spos+(fpos-spos)*(-(scrStep/steps-1)*(scrStep/steps-1)+1));
    scrollPosition=Math.abs(content.scrollTop);
    var scr = findScreen();
    if(scr != curScrn)
    {
        updateCurrentScreen(scr);
    }
}
function scrollToPage(anc)
{
    clearInterval(rep);
    var dur=800;
    var steps=80;
    var content = document.getElementById("contentPage");
    scrStep=0;
    var goal=parseFloat(document.getElementById(slideNames[parseInt(anc)]).offsetTop);
    rep=setInterval(scroll,dur/steps,Math.abs(content.scrollTop),goal,steps);
}
function scrollPg()
{
    if(document.getElementById("contentPage").scrollTop>=parseFloat(document.getElementById("about").offsetTop)) {
      document.getElementById("topBar").style.boxShadow="inset 0px -5px 10px -5px rgba(65,64,66,0.4)";
    }
    else {
      document.getElementById("topBar").style.boxShadow="none";
    }
    updateCurrentScreen(findScreen());
}
function startAnims()
{
    var svgDocument=document.getElementById("downarr").contentDocument;
    try {svgDocument.getElementById('expand').beginElement();}
    catch(err) {}
    document.getElementById("scrollHint").style.width="20vh";
    document.getElementById("scrollHint").style.height="20vh";
    document.getElementById("scrollHint").style.top="-6.9vh";
    document.getElementById("scrollHintContainer").style.top="6.9vh";
    document.getElementById("scrollHintContainer").style.left="0vh";
}
function expandName()
{
    var svgName = document.getElementById("logoImage").contentDocument;
    Array.prototype.forEach.call(svgName.getElementsByClassName("expandName"), function(el) {el.beginElement();});
    document.getElementById("logo").style.overflow="visible";
}
function hideName()
{
    var svgName = document.getElementById("logoImage").contentDocument;
    svgName.getElementById("moveTextClip2").beginElement();
    setTimeout('document.getElementById("logoImage").contentDocument.getElementById("moveDClip2").beginElement()', 400);
    setTimeout('document.getElementById("logoImage").contentDocument.getElementById("moveD2").beginElement()', 400);
    setTimeout('document.getElementById("logo").style.overflow="hidden"',800);
}
function animatePie(pie, perc)
{
    if(perc < 0.5) {
        document.getElementById(pie).getElementsByClassName("rightFill")[0].style.webkitTransform="rotate(" + (-180+perc*360) + "deg)";
        document.getElementById(pie).getElementsByClassName("rightFill")[0].style.mozTransform="rotate(" + (-180+perc*360) + "deg)";
        document.getElementById(pie).getElementsByClassName("rightFill")[0].style.msTransform="rotate(" + (-180+perc*360) + "deg)";
        document.getElementById(pie).getElementsByClassName("rightFill")[0].style.oTransform="rotate(" + (-180+perc*360) + "deg)";
        document.getElementById(pie).getElementsByClassName("rightFill")[0].transform="rotate(" + (-180+perc*360) + "deg)";
    }
    else {
        document.getElementById(pie).getElementsByClassName("rightFill")[0].style.webkitTransform="rotate(0deg)";
        document.getElementById(pie).getElementsByClassName("rightFill")[0].style.mozTransform="rotate(0deg)";
        document.getElementById(pie).getElementsByClassName("rightFill")[0].style.msTransform="rotate(0deg)";
        document.getElementById(pie).getElementsByClassName("rightFill")[0].style.oTransform="rotate(0deg)";
        document.getElementById(pie).getElementsByClassName("rightFill")[0].style.transform="rotate(0deg)";
        setTimeout("document.getElementById('"+pie+"').getElementsByClassName('leftFill')[0].style.webkitTransform='rotate(' + (-180+("+perc+"-0.5)*360) + 'deg)'; document.getElementById('"+pie+"').getElementsByClassName('leftFill')[0].style.mozTransform='rotate(' + (-180+("+perc+"-0.5)*360) + 'deg)'; document.getElementById('"+pie+"').getElementsByClassName('leftFill')[0].style.msTransform='rotate(' + (-180+("+perc+"-0.5)*360) + 'deg)'; document.getElementById('"+pie+"').getElementsByClassName('leftFill')[0].style.oTransform='rotate(' + (-180+("+perc+"-0.5)*360) + 'deg)'; document.getElementById('"+pie+"').getElementsByClassName('leftFill')[0].style.transform='rotate(' + (-180+("+perc+"-0.5)*360) + 'deg)';",500);
    }
}
function checkboxChange(e)
{
    var svgDoc = document.getElementById("hamImage").contentDocument;
    if(document.getElementById("hamMenu").checked)
    {
        document.getElementById("contentPage").style.overflowY="hidden";
        svgDoc.getElementById("toArrow1").beginElement();
        svgDoc.getElementById("toArrow2").beginElement();
    }
    else
    {
        document.getElementById("contentPage").style.overflowY="scroll";
        svgDoc.getElementById("toHam1").beginElement();
        svgDoc.getElementById("toHam2").beginElement();
    }
}
function checkToCollapse(e)
{
    if(e.pageX>=parseFloat(window.getComputedStyle(document.getElementById("contentPage")).left))
    {
        collapseMenu();
    }
}
function collapseMenu()
{
    if(document.getElementById("hamMenu").checked==true)
    {
        document.getElementById("hamMenu").checked=false;
        checkboxChange();
    }
}
function validate(str)
{
    if(str.indexOf("@")==-1) return false;
    var parts = str.split("@");
    if(parts.length != 2) return false;
    if(parts[0].length == 0 || parts[1].length == 0) return false;
    if(parts[1].indexOf(".")==-1) return false;
    if(parts[1].indexOf(".")==0 || parts[1].lastIndexOf(".")==parts[1].length-1) return false;
    return true;
}
