/**
 * Created by David on 4/8/2016.
 */
var status = 'none';
$('#bold').on('click', function() {
    document.execCommand('bold', false, null);
    if(window.getSelection().toString().length>0)
    {

        bodyChanged();
    }
/*if(window.getSelection().toString().length==0 && status!='bold')
{
status = 'bold';
}
    else if(window.getSelection().toString().length==0 && status =='bold')
{
    status = 'none';
}
*/

});

$('#italic').on('click', function() {
    document.execCommand('italic', false, null);
    if(window.getSelection().toString().length>0)
    {

        bodyChanged();
    }
});

$('#underline').on('click', function() {
    document.execCommand('underline', false, null);
    if(window.getSelection().toString().length>0)
    {

        bodyChanged();
    }
});

$('#align-left').on('click', function() {
    document.execCommand('justifyLeft', false, null);bodyChanged();
});

$('#align-center').on('click', function() {
    document.execCommand('justifyCenter', false, null);bodyChanged();
});

$('#align-right').on('click', function() {
    document.execCommand('justifyRight', false, null);bodyChanged();
});

$('#list-ul').on('click', function() {
    document.execCommand('insertUnorderedList', false, null);bodyChanged();
});

$('#list-ol').on('click', function() {
    document.execCommand('insertOrderedList', false, null);bodyChanged();
});

$('#fonts').on('change', function() {
    var font = $(this).val();
    document.execCommand('fontName', false, font);
    if(window.getSelection().toString().length>0)
    {

        bodyChanged();
    }
});
$('#drawOn').on('click', function() {
   if(canvasOn) {
       $('#draw').hide();
       $('#erase').fadeOut();
       erasing = false;
var left = $('#draw').offset().left+40;// added num is padding
       var top = $('#draw').offset().top+20;

       var images = document.images;
      /* for(Image in images)
       {
           //
       }
*/





      /* canvas.toBlob(function(blob) {
           var newImg = document.createElement("img"),
               url = URL.createObjectURL(blob);

           newImg.onload = function() {
               // no longer need to read the blob so it's revoked
               URL.revokeObjectURL(url);
           };

           newImg.src = url;
           document.getElementById('main').appendChild(newImg);
       });
*/
       $('#main').append("<img src='"+canvas.toDataURL()+"' class ='annotate' style=' position:absolute;left:"+left+";top:"+top+"'>");//z-index:10000 id='test'

       canvasOn=false;
       bodyChanged();

   }
    else{
$('#draw').show();
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       $('#erase').fadeIn();
       erasing = false;
       console.log($('#foreColor').val());
       canvas.width = $('.pagev2').width();
       canvas.height = $('.pagev2')[0].scrollHeight;
       ctx.strokeStyle = $('#foreColor').val();
       canvasOn=true;
       $(".annotate").each(function(index)
       {
           var Image = $(this).context;
           // Image.src = $(this).context.currentSrc;
           //console.log($(this).context);

           console.log($(this).offset().left);
           ctx.drawImage(Image,0,0);
           $(this).remove();
       });
   }
});
$('#size').on('change', function() {
    var size = $(this).val();
    document.execCommand("fontSize", false, "7");
    var fontElements = document.getElementsByTagName("font");
    for (var i = 0, len = fontElements.length; i < len; ++i) {
        if (fontElements[i].size == "7") {
            fontElements[i].removeAttribute("size");
            fontElements[i].style.fontSize = size+ 'px';
        }
    }
    //document.getElementById('main').blur();
    if(window.getSelection().toString().length>0)
    {

        bodyChanged();
    }

});
function changeColor(test,color)
{
    if(color=='back')
    {
        document.execCommand("backColor",false,test);
    }
    else {
        document.execCommand("foreColor",false,test);
    }
    if(window.getSelection().toString().length>0)
    {

        bodyChanged();
    }
    
}

