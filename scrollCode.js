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
    var scrollFactor=3*Math.abs(window.pageYOffset)/parseFloat(window.getComputedStyle(document.getElementById("contact")).top);
    document.getElementById("pageSelectorButtons").style.webkitClipPath="circle(10px at 7.5px " + (8.5+scrollFactor*19.5) + "px)";
    updateCurrentScreen(findScreen());
    document.addEventListener("scroll",scrollPg);
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
    document.title="Daniel Dakev | " + slideNames[scr].capitalize();
    document.getElementsByTagName("li")[curScrn].style.backgroundColor="rgba(65,64,66,0.0)";
    document.getElementsByTagName("li")[scr].style.backgroundColor="rgba(65,64,66,0.6)";
    curScrn=scr;
}
function findScreen()
{
    var pos=Math.abs(window.pageYOffset);
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
    if(scrStep==steps)
    {
        clearInterval(rep);
        rep=false;
        return;
    }
    scrStep++;
    window.scrollTo(0,Math.round(spos+(fpos-spos)*(-(scrStep/steps-1)*(scrStep/steps-1)+1)));
    scrollPosition=Math.abs(window.pageYOffset);
    var scrollFactor=3*Math.abs(window.pageYOffset)/parseFloat(window.getComputedStyle(document.getElementById("contact")).top);
    document.getElementById("pageSelectorButtons").style.webkitClipPath="circle(10px at 7.5px " + (8.5+scrollFactor*19.5) + "px)";
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
    scrStep=0;
    var goal=parseFloat(window.getComputedStyle(document.getElementById(slideNames[parseInt(anc)])).top);
    rep=setInterval(scroll,dur/steps,Math.abs(window.pageYOffset),goal,steps);
}
function scrollPg()
{
    var newScr=Math.abs(window.pageYOffset);
    window.scrollTo(0,scrollPosition);
   
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