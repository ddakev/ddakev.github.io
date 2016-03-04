var rep;
var curScrn=0;
//to do: write onscroll function
function findScreen()
{
    var pos=window.scrollY;
    var dist0=Math.abs(pos-parseFloat(getComputedStyle(document.getElementById("s0")).top));
    var dist1=Math.abs(pos-parseFloat(getComputedStyle(document.getElementById("s1")).top));
    var dist2=Math.abs(pos-parseFloat(getComputedStyle(document.getElementById("s2")).top));
    var dist3=Math.abs(pos-parseFloat(getComputedStyle(document.getElementById("s3")).top));
    var mindist=Math.min(Math.min(dist0,dist1),Math.min(dist2,dist3));
    //alert(+" "+dist0+" "+dist1+" "+dist2+" "+dist3);
    if(mindist == dist0) return 0;
    else if(mindist == dist1) return 1;
    else if(mindist == dist2) return 2;
    else if(mindist == dist3) return 3;
}
function scroll(position)
{
    if(Math.abs(position-window.scrollY)<=5)
    {
        window.scrollTo(position);
        clearInterval(rep);
        return;
    }
    if(position>window.scrollY)
        window.scrollBy(0,5);
    else
        window.scrollBy(0,-5);
    var scr = findScreen();
    if(scr != curScrn)
    {
       //alert(scr);
        document.getElementById("page"+curScrn).style.backgroundImage="url(graphics/pagebtn0.svg)";
        document.getElementById("page"+scr).style.backgroundImage="url(graphics/pagebtn1.svg)";
        curScrn=scr;
    }
}
function scrollTo(anc)
{
    clearInterval(rep);
   var goal =parseFloat(window.getComputedStyle(document.getElementById(anc)).top);
    rep=setInterval(scroll,5,goal);
}