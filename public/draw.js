var canvas  = document.getElementById("draw");
var ctx     = canvas.getContext("2d");
var drawing = false;
var canvasOn = false;
var erasing = false;

canvas.onmousedown = function(e){
    e.preventDefault();
    if(!erasing) {
        if (!drawing) {
            drawing = true;
            ctx.beginPath();
        }
    }
    else {

    }
};

canvas.onmousemove = function(e){
    var x = e.clientX - $('#draw').offset().left;
    var y = e.clientY - $('#draw').offset().top;
    ctx.strokeStyle = $('#foreColor').val();
   if(!erasing)
   {
       if( drawing )
       {
           ctx.lineTo(x,y);
           ctx.stroke();
       }
   }
    else {
       ctx.clearRect(x-4, y-4, 8, 8);
   }

};

canvas.onmouseup = function(e){

    // Enable text selection
    //document.body.classList.remove('unselectable')
    drawing = false;
};

canvas.onmouseout = function(e){
    drawing = false;
};
$('#erase').on('click', function(){
erasing = !erasing;
    if(erasing)
    {
        $('#erase').css('color' ,'rgba(255,255,255,.8)');
        $('#erase').css('background' ,'rgba(0,0,0,.3)');
    }
    else {
        $('#erase').css('color' ,'rgba(255,255,255,1)');
        $('#erase').css('background' ,'rgba(0,0,0,0)');
    }



});
$('#switchLayer').on('click', function(){
//switch z-index
});