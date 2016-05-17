// common variables
// require hyxCanvas.js to draw graphic

oReader2 = new FileReader();
firstLineEle = [];
xselect = document.createElement("select");
yselect = document.createElement("select");

var iBytesUploaded = 0;
var iBytesTotal = 0;
var iPreviousBytesLoaded = 0;
var iMaxFilesize = 1048576; // 1MB
var oTimer = 0;
var sResultFileSize = '';

function secondsToTime(secs) { // we will use this function to convert seconds in normal time format
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600))/60);
    var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (hr < 10) {hr = "0" + hr; }
    if (min < 10) {min = "0" + min;}
    if (sec < 10) {sec = "0" + sec;}
    if (hr) {hr = "00";}
    return hr + ':' + min + ':' + sec;
};

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

// 文本转换为数组，pointsArr包含[x, y]
function txt2xy(readerResult, xindex, yindex, sep, lineNum){
    if (typeof readerResult == "string"){
        var pointsArr = [];
        var dicwithTime = {};
        var lines = readerResult.split("\n");  // split will return Array.
        var sep = arguments[3] ? arguments[3] : ",";
        var xindex = arguments[1] ? arguments[1] : 8;
        var yindex = arguments[2]? arguments[2]: xindex + 1;

        // stats contain xmax, xmin, ymax, ymin.. 可以用作栅格统计
        var stats = [0, 10000000000, 0, 10000000000];
        for (var i = 0, length = lines.length - 1; i < length; i++) {
            try{
                var data = lines[i].split(sep);
                var pointx = parseFloat(data[xindex]);
                var pointy = parseFloat(data[yindex]);
                stats[0] = stats[0] > pointx ? stats[0] : pointx;
                stats[1] = stats[1] < pointx ? stats[1] : pointx;
                stats[2] = stats[2] > pointy ? stats[2] : pointy;
                stats[3] = stats[3] < pointy ? stats[3] : pointy;
                var point = [pointx, pointy];
                pointsArr.push(point);
            }
            catch(ex){
                console.log("split single line err: " + ex.message);
            }
        }
        pointsArr.push(stats);
        return pointsArr;
        // how to optimize the performance of iterator. use map( )
    }
}

function renderPoints(pointsArr){    
    var canv = gele("canv");
    canv.style.display = "block";
    clearCanv();
    var canvWidth = canv.width;
    var canvHeight = canv.height;
    // read pointsArr[length-1] to get stat
    var len = pointsArr.length;
    var stats = pointsArr[len-1];
    var xmax = stats[0], xmin = stats[1], ymax = stats[2], ymin = stats[3];
    var xrange = xmax - xmin, yrange = ymax - ymin;
    var ratio = canvWidth/xrange < canvHeight/yrange ? canvWidth/xrange : canvHeight/yrange;
    if (pointsArr instanceof Array){
        for (var i = pointsArr.length - 2; i >= 0; i--) {
             drawPoint( pointx2pixel(pointsArr[i][0], xmin, ratio), pointy2pixel(pointsArr[i][1], ymin, ratio) );
         }
         console.log("renderPoints complete! ");
    }
}


function pointx2pixel(pointx, xmin, ratio){
    pixelx = (pointx - xmin) * ratio ;
    return pixelx;
}
function pointy2pixel(pointy, ymin, ratio){
    pixely = gele("canv").height - (pointy - ymin) * ratio;
    return pixely;
}

// 由Render按钮触发。
function UserRender(){
    console.log("start 2 read User option！");
    var xindex = firstLineEle.indexOf(document.getElementsByTagName("select")[0].value);
    var yindex = firstLineEle.indexOf(document.getElementsByTagName("select")[1].value);
    var pointsArr = txt2xy(oReader2.result, xindex, yindex);
    renderPoints(pointsArr);
}

// 是否应该创建闭包！因为fileSelected函数中有一个重要的oReader2, 表示读取到的文本文件。
// 
function fileSelected() {

    // hide different warnings
    document.getElementById('upload_response').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';

    // get selected file element
    var oFile = document.getElementById('image_file').files[0];

    // filter for image files
    var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
    if (! rFilter.test(oFile.type)) {
        var error = document.getElementById('error');        
        //var oReader2 = new FileReader();
        oReader2.readAsText(oFile);
        oReader2.onload = function(){
            // onload means reader's readyState == 2. reading complete!
            var firstLine = oReader2.result.split("\n")[0];
            try{
                firstLineEle = firstLine.split(',');
            }
            catch(ex){
                console.log("split single line err: " + ex.message);
                return;
            }
            error.innerHTML = "<p>firstLine is: </p>" + firstLine +
                "<p> Pls choose the x, y field </p>";
            error.style.display = 'block';
            // 触发用户对xy 字段的选择。再进行渲染
            xselect.innerHTML = "";
            yselect.innerHTML = "";
            for (var i = firstLineEle.length - 1; i >= 0; i--) {
                xselect.innerHTML += "<option>"+ firstLineEle[i] +"</option>";
                yselect.innerHTML += "<option>"+ firstLineEle[i] +"</option>";
            };
            error.appendChild(xselect);
            error.appendChild(yselect);
            // 创建函数，并且在大函数最后返回该函数引用，创建闭包。oReader2 , firstLine等变量一直可用。

            error.innerHTML += "<input type='button' onclick='UserRender()' value='Render'/>";
        }
        console.log("End of preprocess of txtfile. Waiting for user option..");
        return;
    }

    // 如果是图像，要执行以下操作
    if (oFile.size > iMaxFilesize) {
        document.getElementById('warnsize').style.display = 'block';
        return;
    }
    // get preview element
    var oImage = document.getElementById('preview');
    // prepare HTML5 FileReader
    var oReader = new FileReader();
    oReader.onload = function(e){
        // e.target.result contains the DataURL which we will use as a source of the image
        oImage.src = e.target.result;
        oImage.onload = function () { // binding onload event
            // we are going to display some custom image information here
            sResultFileSize = bytesToSize(oFile.size);
            document.getElementById('fileinfo').style.display = 'block';
            document.getElementById('filename').innerHTML = 'Name: ' + oFile.name;
            document.getElementById('filesize').innerHTML = 'Size: ' + sResultFileSize;
            document.getElementById('filetype').innerHTML = 'Type: ' + oFile.type;
            document.getElementById('filedim').innerHTML = 'Dimension: ' + oImage.naturalWidth + ' x ' + oImage.naturalHeight;
        };
    };

    // read selected file as DataURL
    oReader.readAsDataURL(oFile);
}

function startUploading() {
    // cleanup all temp states
    iPreviousBytesLoaded = 0;
    document.getElementById('upload_response').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';
    document.getElementById('progress_percent').innerHTML = '';
    var oProgress = document.getElementById('progress');
    oProgress.style.display = 'block';
    oProgress.style.width = '0px';

    // get form data for POSTing
    //var vFD = document.getElementById('upload_form').getFormData(); // for FF3
    var vFD = new FormData(document.getElementById('upload_form'));

    // create XMLHttpRequest object, adding few event listeners, and POSTing our data
    var oXHR = new XMLHttpRequest();        
    oXHR.upload.addEventListener('progress', uploadProgress, false);
    oXHR.addEventListener('load', uploadFinish, false);
    oXHR.addEventListener('error', uploadError, false);
    oXHR.addEventListener('abort', uploadAbort, false);
    oXHR.open('POST', 'doAction.aspx');
    oXHR.send(vFD);

    //$.post("",param)

    // set inner timer
    oTimer = setInterval(doInnerUpdates, 300);
}

function doInnerUpdates() { // we will use this function to display upload speed
    var iCB = iBytesUploaded;
    var iDiff = iCB - iPreviousBytesLoaded;

    // if nothing new loaded - exit
    if (iDiff == 0)
        return;

    iPreviousBytesLoaded = iCB;
    iDiff = iDiff * 2;
    var iBytesRem = iBytesTotal - iPreviousBytesLoaded;
    var secondsRemaining = iBytesRem / iDiff;

    // update speed info
    var iSpeed = iDiff.toString() + 'B/s';
    if (iDiff > 1024 * 1024) {
        iSpeed = (Math.round(iDiff * 100/(1024*1024))/100).toString() + 'MB/s';
    } else if (iDiff > 1024) {
        iSpeed =  (Math.round(iDiff * 100/1024)/100).toString() + 'KB/s';
    }

    document.getElementById('speed').innerHTML = iSpeed;
    document.getElementById('remaining').innerHTML = '| ' + secondsToTime(secondsRemaining);        
}

function uploadProgress(e) { // upload process in progress
    if (e.lengthComputable) {
        iBytesUploaded = e.loaded;
        iBytesTotal = e.total;
        var iPercentComplete = Math.round(e.loaded * 100 / e.total);
        var iBytesTransfered = bytesToSize(iBytesUploaded);

        document.getElementById('progress_percent').innerHTML = iPercentComplete.toString() + '%';
        document.getElementById('progress').style.width = (iPercentComplete * 4).toString() + 'px';
        document.getElementById('b_transfered').innerHTML = iBytesTransfered;
        if (iPercentComplete == 100) {
            var oUploadResponse = document.getElementById('upload_response');
            oUploadResponse.innerHTML = '<h1>Please wait...processing</h1>';
            oUploadResponse.style.display = 'block';
        }
    } else {
        document.getElementById('progress').innerHTML = 'unable to compute';
    }
}

function uploadFinish(e) { // upload successfully finished
    var oUploadResponse = document.getElementById('upload_response');
    oUploadResponse.innerHTML = e.target.responseText;
    oUploadResponse.style.display = 'block';

    document.getElementById('progress_percent').innerHTML = '100%';
    document.getElementById('progress').style.width = '400px';
    document.getElementById('filesize').innerHTML = sResultFileSize;
    document.getElementById('remaining').innerHTML = '| 00:00:00';

    clearInterval(oTimer);
}

function uploadError(e) { // upload error
    document.getElementById('error2').style.display = 'block';
    clearInterval(oTimer);
}  

function uploadAbort(e) { // upload abort
    document.getElementById('abort').style.display = 'block';
    clearInterval(oTimer);
}