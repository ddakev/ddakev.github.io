/*
To-dos:
- on mobile, on swipe from right to left, if menu is open, collapse

*/
var rep;
var curScrn=0;
var scrStep=0;
var scrollPosition=0;
var slideNames=["home","about","projects","contact","copyright"];
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
function startAnimations()
{
    var content=document.getElementById("contentPage");
    scrollPosition=content.scrollTop;
    var scrollFactor=3*Math.abs(content.scrollTop)/parseFloat(window.getComputedStyle(document.getElementById("contact")).top);
    document.getElementById("pageSelectorButtons").style.webkitClipPath="circle(10px at 7.5px " + (8.5+scrollFactor*19.5) + "px)";
    updateCurrentScreen(findScreen());
    if(window.innerWidth>640) {
        document.getElementById("logo").addEventListener("mouseover", expandName);
        document.getElementById("logo").addEventListener("mouseout", hideName);
    }
    Array.prototype.forEach.call(document.getElementsByTagName("input"), function(inp) {
        if(inp.getAttribute("type")=="text") {
            inp.addEventListener("focus", function(i) {
                inp.parentNode.getElementsByClassName("cLabel")[0].style.fontSize="8pt"; inp.parentNode.getElementsByClassName("cLabel")[0].style.marginTop="0";
            });
            inp.addEventListener("blur", function(i) {
                if(inp.value=="") {
                    inp.parentNode.getElementsByClassName("cLabel")[0].style.fontSize="12pt";
                    inp.parentNode.getElementsByClassName("cLabel")[0].style.marginTop="10px";
                }
            });
        }
    });
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
    document.getElementById('scrollHint').style.animationPlayState='running';
    document.getElementById('scrollHint').addEventListener("animationend",startAn);
    if(navigator.userAgent.indexOf("Firefox")!=-1) 
    {
        document.getElementById("downarr").contentDocument.getElementById("expand").setAttribute("keySplines",".48 .34 .82 .67; .34 .44 .87 1");
    }
}
function updateCurrentScreen(scr)
{
    window.location.hash=slideNames[scr];
    document.title=slideNames[scr].capitalize() + " | Daniel Dakev";
    if(window.getComputedStyle(document.getElementById("hamMenuLabel")).display=="none")
    {
        document.getElementsByTagName("li")[curScrn].style.backgroundColor="rgba(65,64,66,0.0)";
        document.getElementsByTagName("li")[curScrn].style.boxShadow="none";
        document.getElementsByTagName("li")[scr].style.backgroundColor="rgba(65,64,66,0.6)";
        document.getElementsByTagName("li")[scr].style.boxShadow="inset 0px 0px 6px -1px rgba(31,30,32,0.6)";
    }
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
    document.getElementById("pageSelectorButtons").style.webkitClipPath="circle(10px at 7.5px " + (8.5+scrollFactor*19.5) + "px)";
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
function startAn()
{
    var svgDocument=document.getElementById("downarr").contentDocument;
    svgDocument.getElementById('expand').beginElement();
    document.getElementById("scrollHint").style.webkitClipPath="circle(60% at 50% 50%)";
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