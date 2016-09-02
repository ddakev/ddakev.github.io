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
        mItems[i].addEventListener("click",collapseMenu);
        mItems[i].children[0].addEventListener("mouseenter",function(event){event.target.style.backgroundColor="rgba(65,64,66,0.6)";});
        mItems[i].children[0].addEventListener("mouseout",function(event){if(event.target != document.getElementsByClassName("menuItem")[curScrn].children[0]) event.target.style.backgroundColor="rgba(65,64,66,0.0)";});
    }
    
    var ta = document.getElementsByTagName("textarea")[0];
    ta.addEventListener("mouseover", function(e) {
        ta.style.background="rgb(240,240,220)";
    });
    ta.addEventListener("mouseout", function(e) {
        if(ta !== document.activeElement)
            ta.style.background="rgb(230,230,210)";
    });
    ta.addEventListener("focus", function(e) {
        ta.style.background="rgb(240,240,220)";
        ta.style.boxShadow="0 0 8px -1px rgb(150,150,150)";
    });
    ta.addEventListener("blur", function(e) {
        ta.style.background="rgb(230,230,210)";
        ta.style.boxShadow="none";
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
                inp.style.background="rgb(240,240,220)";
                inp.style.boxShadow="0 0 8px -1px rgb(150,150,150)";
            });
            inp.addEventListener("blur", function(i) {
                inp.style.background="rgb(230,230,210)";
                inp.style.boxShadow="none";
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
                inp.style.background="rgb(240,240,220)";
            });
            inp.addEventListener("mouseout", function(e) {
                if(inp !== document.activeElement)
                    inp.style.background="rgb(230,230,210)";
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
    window.location.hash=slideNames[scr];
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
    
    visited[scr] = 1;
    curScrn=scr;
}
function findScreen()
{
    var content=document.getElementById("contentPage");
    var pos=Math.abs(content.scrollTop);
    var dist0=Math.abs(pos-parseFloat(getComputedStyle(document.getElementById(slideNames[0])).top));
    var dist1=Math.abs(pos-parseFloat(getComputedStyle(document.getElementById(slideNames[1])).top));
    var dist2=Math.abs(pos-parseFloat(getComputedStyle(document.getElementById(slideNames[2])).top));
    var dist3=Math.abs(pos-parseFloat(getComputedStyle(document.getElementById(slideNames[3])).top));
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
    var scrollFactor=3*Math.abs(content.scrollTop)/parseFloat(window.getComputedStyle(document.getElementById("contact")).top);
    document.getElementById("pageSelectorClip").style.top=(3+scrollFactor*21) + "px";
    document.getElementById("pageSelectorButtons").style.top=(-3-scrollFactor*21) + "px";
    var cSlides = document.getElementsByClassName("contents");
    for(var l=0; l<cSlides.length; l++)
    {
        var topClip=(-parseFloat(window.getComputedStyle(cSlides[l].parentElement).top)+content.scrollTop)*100/window.innerHeight;
        var iClip="inset("+topClip.toString()+"vh 0px 0px 0px)";
        cSlides[l].style.webkitClipPath=iClip;
    }
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
    var goal=parseFloat(window.getComputedStyle(document.getElementById(slideNames[parseInt(anc)])).top);
    rep=setInterval(scroll,dur/steps,Math.abs(content.scrollTop),goal,steps);
}
function scrollPg()
{
    var content=document.getElementById("contentPage");
    var newScr=Math.abs(content.scrollTop);
    if(window.innerHeight!=lScrnHeight || window.innerWidth!=lScrnWidth) {
        scrStep=0;
        scroll(content.scrollTop,parseInt(window.getComputedStyle(document.getElementById(slideNames[curScrn])).top),1);
        lScrnHeight=window.innerHeight;
        lScrnWidth=window.innerWidth;
        return;
    }
    content.scrollTop=scrollPosition;
   
    if(!rep)
    {
        if(slideNames.indexOf(window.location.hash.slice(1))!=curScrn && slideNames.indexOf(window.location.hash.slice(1))!=-1)
        {
            return;
        }
        if(newScr>scrollPosition)
        {
            if(curScrn<3)
                scrollToPage(curScrn+1);
            else
                scrollToPage(4);
        }
        else if(newScr<scrollPosition)
            scrollToPage(Math.max(0,(curScrn-1)));
    }
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