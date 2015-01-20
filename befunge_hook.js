function BefungeSelector(code,outputdiv,codediv,stackdiv){
  this.outputdiv = outputdiv;
  this.codediv = codediv;
  this.stackdiv = stackdiv;

  this.befunge = new Befunge(false);
  this.program = this.befunge.load(code);
  this.makeGrid();

  this.befunge.step(this,BefungeSelector.delay);
}

BefungeSelector.delay = 250;

BefungeSelector.prototype.makeGrid = function(){
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


BefungeSelector.prototype.createID = function(position){
  return "row" + parseInt(position[1]) + "" + "col" + parseInt(position[0]) + "";
};

BefungeSelector.prototype.step = function(closure){
  var pointer = closure.pointer;
  var output = closure.output;
  var stack = closure.stack;
  var command = closure.command;

  if (output) $(this.outputdiv).append(output);

  this.previousPosition = this.currentPosition;
  this.currentPosition = pointer.getPosition();

  //update grid to select correct cell
  $("#" + this.createID(this.currentPosition)).css({"background-color" : "blue"});
  if (this.previousPosition) $("#" + this.createID(this.previousPosition)).css({"background-color" : "white"});
  
  //command specific
  if (command == "," || command == ".") $("#" + this.createID(this.currentPosition)).css({"background-color" : "green"});
  

  //recreate stack
  this.makeStack(stack);
};

BefungeSelector.prototype.makeStack = function(stack) {
  $(this.stackdiv).empty();
  for (var x = 0; x < stack.arr.length; x++){

    var item = stack.arr[x];
    if (item >= 32 && item <= 136) item = String.fromCharCode(item);
    if (item == " ") item = "&nbsp;";

    $(this.stackdiv).append($("<span class = 'stackcell'></span>").html(item));
  }
};

BefungeSelector.prototype.finish = function(){
  console.log("output ended!");
}
