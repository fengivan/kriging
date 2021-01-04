let maxpoints = 10;                                         //maximum # of points is limited for performance reasons
let points=0;                                               //points so far
let input=[];                                               //input contains the x-y pos and the values at the given x-y positions
let cc=1800;                                                //exponential covariance parameter
let ca=300;                                                 //exponential covariance parameter
let table=document.querySelector(".input");                 
let mouseguide=document.querySelector(".mousepos");         
let grid = document.querySelector(".grid");                 
grid.addEventListener("click", recordpoint);                
grid.addEventListener("mousemove",updatepos);               
let krigged=false;                                          //flag for if showing krigged value at mousepos is on or off
implementbuttons();                                                 

function getrange(data)                                     //gets the min and max of the input values (for color gradient generation)
{
    let min=Infinity;
    let max=-Infinity;
    for(let i =0; i<data.length; i++)
    {
        if(parseInt(data[i][2])<min)
            min=data[i][2];
        if(parseInt(data[i][2])>max)
            max=data[i][2];
    }
    return [min, max];
}

function fillgrid()                                         //fills the grid with 40*40 divs. The color is based on the krigged value at the center of the box, red for max, white for min.
{
    let gridboxes=40;
    let smallest=getrange(input)[0];
    let biggest=getrange(input)[1];
    cleargrid();
    var rect=grid.getBoundingClientRect();
    for(var i =0; i<gridboxes; i++)
    {
        for(var j=0; j<gridboxes; j++)
        {   
            var x = i*800/gridboxes; 
            var y = j*800/gridboxes;
            let boxcolor=(1-(krig(x+400/gridboxes, 800-y+400/gridboxes, input, cc, ca)-smallest)/(biggest-smallest))*255;
            var sq=document.createElement("div");
            sq.className="box";
            sq.style.left=x+"px";
            sq.style.top=y+"px";
            sq.style.backgroundColor="rgb(255,"+boxcolor+","+boxcolor+")";
            grid.appendChild(sq);
        }
    }
}

function implementbuttons()                                 //implements color and krig buttons
{
    document.querySelector(".clear").addEventListener("click", clear);
    document.querySelector(".krig").addEventListener("click", run);
}

function krig(x, y, data, covariancec, covariancea)         //returns the kriged value at x,y, given a set of x-y points and the values at those x-y points
{
    let matrix=[];
    let lastrow=[];
    let vals=[];
    for(let i =0; i<data.length; i++)
    {
        let temp=[];
        for(let j=0; j<data.length; j++)
        {
            temp.push(covariancec*Math.exp(-Math.pow(Math.pow(data[i][0]-data[j][0], 2)+Math.pow(data[i][1]-data[j][1],2),.5)/covariancea));
        }
        vals.push(covariancec*Math.exp(-Math.pow(Math.pow(data[i][0]-x, 2)+Math.pow(data[i][1]-y,2), .5)/covariancea));
        temp.push(1);
        lastrow.push(1);
        matrix.push(temp);
    }
    lastrow.push(0);
    vals.push(1);
    matrix.push(lastrow);
    let results=math.multiply(math.inv(matrix), vals);
    let output=0;
    for(let i =0; i<results.length-1; i++)
        output+=results[i]*data[i][2];
    
    return output;
}

function clear()                                            //clears everything on the grid and in the table
{
    krigged=false;
    points=0;
    input=[];
    cleargrid();
    mouseguide.rows[1].cells[2].innerHTML=0;
    while(table.childNodes.length>2)
        table.removeChild(table.lastChild);
}

function cleargrid()                                        //clears the gird
{
    while(grid.childNodes.length>0)
        grid.removeChild(grid.lastChild);
    
}

function updatepos(e)                                       //updates the mouse position indiator on mouse movement within the grid
{
    var rect = grid.getBoundingClientRect();
    var x = e.clientX - rect.left; 
    var y = e.clientY - rect.top;  
    mouseguide.rows[1].cells[0].innerHTML=x;
    mouseguide.rows[1].cells[1].innerHTML=800-y;
    if(krigged)
        mouseguide.rows[1].cells[2].innerHTML=Math.round(krig(x, 800-y, input, cc, ca)*10000)/10000;

}

function run()                                              //collects all the data from the table, and calls fillgrid. also sets boolean flag
{
    cc=document.querySelector(".c").value;
    ca=document.querySelector(".a").value;
    for(var i=1; i<points+1; i++)
        input.push([table.rows[i].cells[0].innerHTML,table.rows[i].cells[1].innerHTML,table.rows[i].cells[2].children[0].value]);
    fillgrid();
    krigged=true;
}

function recordpoint(e)                                     //records mouse clicks on the grid and marks the points in the table.
{
    if(points>=maxpoints) 
        return;
    points++;
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; 
    var y = e.clientY - rect.top;  
    var dot=document.createElement("div");
    dot.className="dot";
    dot.style.left=x-5+"px";
    dot.style.top=y-5+"px";
    grid.appendChild(dot);
    var newrow=document.createElement("tr");
    var newx=document.createElement("td");
    newx.innerHTML=x;
    var newy=document.createElement("td");
    newy.innerHTML=800-y
    var newval=document.createElement("td");
    newval.appendChild(document.createElement("input"));
    newrow.appendChild(newx);
    newrow.appendChild(newy);
    newrow.appendChild(newval);
    table.appendChild(newrow);
}