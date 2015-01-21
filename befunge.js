//overarching interpreter class

function Befunge(verbose){
  this.verbose = verbose;
  this.isStringMode = false;

  this.stack = new Stack();
  this.program = new BefungeProgram();
  this.pointer = new Pointer();

  this.exitState = false;
}

Befunge.prototype.load = function(code,step){
  this.program.loadProgram(code);
  return this.program;
};

Befunge.prototype.run = function(){
  var ret = "";
  while (!this.exitState){
    this.printVerbose();

    var t = this.executeCommand(this.getCommand());
    if (t) ret += t;
    this.pointer.advance();
    this.checkBounds();
  }
  return ret;
}

Befunge.prototype.step = function(hookInstance,step){
	this.printVerbose();

  var command = this.program.getCommand(this.pointer.getPosition());
	var out = this.executeCommand(command);

	if (typeof(hookInstance.step) == 'function'){
		hookInstance.step({
			pointer : this.pointer,
			output : out,
      stack : this.stack,
      command : command
		});
	}

  this.pointer.advance();
  this.checkBounds();

	if (!this.exitState){
		var pthis = this;
		setTimeout(function(){
			pthis.step(hookInstance,step);
		}, step);
	}
}

Befunge.prototype.exit = function(){
	this.exitState = true;
}

Befunge.prototype.printVerbose = function(){
	if (this.verbose){
    console.log(this.pointer);
    console.log(this.stack);
    console.log(this.program.getCommand(this.pointer.getPosition()));
    console.log("--------------------");
    }
}

Befunge.prototype.executeCommand = function(command){
  if (this.isStringMode){
    return Commands.commands["\""].call(this);
  }
  else {
    return Commands.commands[command].call(this);
  }
}

Befunge.prototype.checkBounds = function(){
  var bounds = [80,25]

  for (var i = 0; i <= 1; i++){// shh
    if (this.pointer.getPosition()[i] > bounds[i]){
      var newPosition = this.pointer.getPosition();
      newPosition[i] = 0;
      this.pointer.setPosition(newPosition);
    }

    if (this.pointer.getPosition()[i] < 0){
      newPosition = this.pointer.getPosition();
      newPosition[i] = bounds[i];
      this.pointer.setPosition(newPosition);
    }
  }
}

//abstracted out program class, for use with both the hook and interpreter

function BefungeProgram(){
  this.program = {};
}

BefungeProgram.prototype.loadProgram = function(program) {
  var rows = program.split("\n");

  this.height = rows.length;
  this.width = 0;

  for (var y = 0; y < rows.length; y++){
    var row = rows[y];
    if (row.length > this.width) this.width = row.length;

    for (var x = 0; x < row.length; x++){
      var char = row[x];
      this.program[[x,y]] = char;
    }
  }
};

BefungeProgram.prototype.getCommand = function(position){
  var command = this.program[position];
  return command ? command : " ";
};

BefungeProgram.prototype.setCell = function(position, value){
	this.program[position] = value;
}

BefungeProgram.prototype.extractProgram = function(){
	var ret = "";
	for (var y = 0; y < this.height; y++){
		 for (var x = 0; x < this.width; x++){
			ret += this.getCommand([x,y]);
		 }
		 ret += "\n";
	 }
	 return ret;
}


//instruction pointer class

function Pointer(){
  this.position = [0,0];
  this.direction = Pointer.directions.EAST;
}

Pointer.directions = {
    NORTH : [0,-1],
    SOUTH : [0,1],
    EAST : [1,0],
    WEST : [-1,0]
  }

Pointer.prototype.setDirection = function(direction){
  if (direction in Pointer.directions){
    this.direction = Pointer.directions[direction]
  }
  else {
    console.log("incorrect direction");
  }
}

Pointer.prototype.getPosition = function(){
  return this.position;
}

Pointer.prototype.setPosition = function(newPosition){
  this.position = newPosition;
}

Pointer.prototype.advance = function(){
  var pthis = this;
  this.position = this.position.map(function(val,index){
    return val + pthis.direction[index]
  });
}

Pointer.prototype.setRandomDirection = function(){
  var random = Math.floor(Math.random()*4);
  console.log(random);
  var direction = Object.keys(Pointer.directions)[random];
  this.direction = Pointer.directions[direction];
}


//commands library, call commands on a Befunge object


Commands = function(){}
Commands.error = function(){
  console.log("Error Found");
  this.exitState = true;
}
Commands.zero = function(){this.stack.push(0);}
Commands.one = function(){this.stack.push(1);}
Commands.two = function(){this.stack.push(2);}
Commands.three = function(){this.stack.push(3);}
Commands.four = function(){this.stack.push(4);}
Commands.five = function(){this.stack.push(5);}
Commands.six = function(){this.stack.push(6);}
Commands.seven = function(){this.stack.push(7);}
Commands.eight = function(){this.stack.push(8);}
Commands.nine = function(){this.stack.push(9);}
Commands.addition = function(){
  var a = this.stack.pop();
  var b = this.stack.pop();
  this.stack.push(a+b);
}
Commands.subtraction = function(){
  var a = this.stack.pop();
  var b = this.stack.pop();
  this.stack.push(b-a);

}
Commands.multiplication = function(){
  var a = this.stack.pop();
  var b = this.stack.pop();
  this.stack.push(a*b);
}
Commands.integerDivision = function(){
  var a = this.stack.pop();
  var b = this.stack.pop();
  if (a == 0) this.stack.push(0);
  this.stack.push(Math.round(b/a));
}
Commands.modulo = function(){
  var a = this.stack.pop();
  var b = this.stack.pop();
  if (a == 0) this.stack.push(0);
  this.stack.push(b % a);
}
Commands.logicalNot = function(){
  this.stack.push(this.stack.pop() == 0 ? 1 : 0);
}
Commands.greaterThan = function(){
  var a = this.stack.pop();
  var b = this.stack.pop();
  this.stack.push(b > a ? 0 : 1)
}
Commands.east = function(){
  this.pointer.setDirection("EAST");
}
Commands.west = function(){
  this.pointer.setDirection("WEST");
}
Commands.north = function(){
  this.pointer.setDirection("NORTH");
}
Commands.south = function(){
  this.pointer.setDirection("SOUTH");
}
Commands.randomDirection = function(){
	console.log("wee")
  this.pointer.setRandomDirection();
}
Commands.hpop = function(){
  if (this.stack.pop() == 0) this.pointer.setDirection("EAST");
  else this.pointer.setDirection("WEST");
}
Commands.vpop = function(){
  if (this.stack.pop() == 0) this.pointer.setDirection("NORTH");
  else this.pointer.setDirection("SOUTH");
}
Commands.stringMode = function(){
  if (this.program.getCommand(this.pointer.getPosition()) != "\""){
    this.stack.push(this.program.getCommand(this.pointer.getPosition()).charCodeAt(0));//push char if this.isStringMode
  }
  else this.isStringMode = (this.isStringMode ? false : true)//swap modes if "
}
Commands.duplicate = function(){
  this.stack.push(this.stack.peek());
}
Commands.swap = function(){
  var a = this.stack.pop();
  var b = this.stack.pop();
  this.stack.push(a);
  this.stack.push(b);
}
Commands.discard = function(){
  this.stack.pop();
}
Commands.integerOutput = function(){
  return this.stack.pop(); // everything is stored as an int
}
Commands.stringOutput = function(){
  return String.fromCharCode(this.stack.pop());
}
Commands.trampoline = function(){
  this.pointer.advance();
}
Commands.put = function(){
  var y = this.stack.pop();
  var x = this.stack.pop();
  var v = this.stack.pop();
  this.program.setCell([x,y],String.fromCharCode(v));
}
Commands.get = function(){
  var y = this.stack.pop();
  var x = this.stack.pop();
  this.stack.push(this.program.getCommand([x,y]).charCodeAt(0));
}
Commands.end = function(){
  this.exitState = true;
}
Commands.noop = function(){}
//actual command listing
Commands.commands = {
  '0' : Commands.zero,
  '1' : Commands.one,
  '2' : Commands.two,
  '3' : Commands.three,
  '4' : Commands.four,
  '5' : Commands.five,
  '6' : Commands.six,
  '7' : Commands.seven,
  '8' : Commands.eight,
  '9' : Commands.nine,
  '+' : Commands.addition,
  '-' : Commands.subtraction,
  '*' : Commands.multiplication,
  '/' : Commands.integerDivision,
  '%' : Commands.modulo,
  '!' : Commands.logicalNot,
  '`' : Commands.greaterThan,
  '>' : Commands.east,
  '<' : Commands.west,
  '^' : Commands.north,
  'v' : Commands.south,
  '?' : Commands.randomDirection,
  '_' : Commands.hpop,
  '|' : Commands.vpop,
  '\"': Commands.stringMode,
  ':' : Commands.duplicate,
  '\\': Commands.swap,
  '$' : Commands.discard,
  '.' : Commands.integerOutput,
  ',' : Commands.stringOutput,
  '#' : Commands.trampoline,
  'p' : Commands.put,
  'g' : Commands.get,
  '@' : Commands.end,
  ' ' : Commands.noop,
  'unknown' : Commands.error
}

//funge-compliant stack

function Stack(){
  this.arr = []
}

Stack.prototype.push = function(val){
  this.arr.push(val);
}

Stack.prototype.pop = function(){
  var a = this.arr.pop();
  if (a) return a;
  else return 0;
}

Stack.prototype.peek = function(){
  return this.arr[this.arr.length-1];
}
