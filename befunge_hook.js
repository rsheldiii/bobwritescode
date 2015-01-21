function BefungeSelector(code,delay,outputdiv,codediv,stackdiv){//TODO: need more div control or break off div control to something else? god damn. need div control for input textarea
  this.delay = delay || BefungeSelector.delay;
  
  this.outputdiv = outputdiv;
  this.codediv = codediv;
  this.stackdiv = stackdiv;

  this.position = [-1,-1];
  this.previosPosition = [-1,-1];

  this.befunge = new Befunge(false);
  this.program = this.befunge.load(code);

  this.makeGrid();

  this.befunge.step(this,this.delay);
}

BefungeSelector.delay = 7.5;

BefungeSelector.prototype.step = function(closure){
  if (this.exitState) return;
	
  var pointer = closure.pointer;
  var output = closure.output;
  var stack = closure.stack;
  var command = closure.command;

  if (output){
	  this.makeOutput(output);
  }
  
  if (command == "p"){
	  this.makeGrid();//grid has changed
  }

  this.previousPosition = this.position;
  this.position = pointer.getPosition();

  //update grid to select correct cell
  $("#" + this.createID(this.position)).css({"background-color" : "rgba(25,25,225,1)"});
  if(this.previousPosition) $("#" + this.createID(this.previousPosition)).css({"background-color" : "rgba(255,255,255,1)"});


  //command specific
  if (command == "," || command == ".") $("#" + this.createID(this.position)).css({"background-color" : "green"});


  //recreate stack
  this.makeStack(stack);
};

BefungeSelector.prototype.makeGrid = function(){
  $(this.codediv).empty();
	
  var cellHTML = "<span></span>";
  var rowHTML = "<div></div>";

  for (var y = 0; y < this.program.height; y++){
    var row = $(rowHTML);
    for (var x = 0; x < this.program.width; x++){
      var id = this.createID([x,y]);
      var text = this.program.getCommand([x,y]);
      if (text == " ") text = "&nbsp;";

      row.append($(cellHTML).attr("id",id).html(text));
    }
    $(this.codediv).append(row);
  }
};

 BefungeSelector.prototype.extractGrid = function(){
	return this.program.extractProgram();
 }

BefungeSelector.prototype.makeStack = function(stack) {
  $(this.stackdiv).empty();
  for (var x = 0; x < stack.arr.length; x++){

    var item = stack.arr[x];
    if (item >= 32 && item <= 136) item = String.fromCharCode(item);
    if (item == " ") item = "&nbsp;";

    $(this.stackdiv).append($("<span class = 'stackcell'></span>").html(item));
  }
};

BefungeSelector.prototype.makeOutput = function(output) {
  if (output){
    var html = $(this.outputdiv).attr("html") || "";
    html += output;
    $(this.outputdiv).attr("html",html);
    $(this.outputdiv).html(html);
  }
};

BefungeSelector.prototype.clearOutput = function(){
	$(this.outputdiv).attr("html", "");
}

BefungeSelector.prototype.createID = function(position){
  return "row" + parseInt(position[1]) + "" + "col" + parseInt(position[0]) + "";
};

BefungeSelector.prototype.finish = function(){
  console.log("output ended!");
}

BefungeSelector.prototype.exit = function(){
	this.exitState = true;
	//you must call this in order to tell the befunge interpreter to stop interpreting
	this.clearOutput();
	this.befunge.exit();
}
