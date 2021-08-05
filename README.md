# Global optimization tool
This is a tool that enables you to take the global minimum of the given function. 
	
A function should be of no more than 9 different variables. 
	
To name a variable you need to call it like 'x<number from 1 to 9>'. For example, correct function input would be 'x1^2+2*x1*x2+x2^2'.
	
Some of the textboxes of the tool take input in vector form. For example if the given function is of 2 variables then the upper boundary parameter may be '10 10' and lower boundary '-10 -10'. Variables in the lower boundary should be less than variables in the upper boundary.

# Contributing
Here "terminal" means Windows Command Prompt (cmd). You may use Terminal in Linux as well.
Requirements: node.js packet manager (npm).

1. Clone the repository;
2. Change directory in terminal to that cloned on your computer; 
3. Install dependencies by executing "npm install" in terminal;
4. "npm start" to start development. 

"npm start" will create a local server at localhost:3000. Now you may change files in "src" folder and immediatly see result at the local server.

To build project run command "npm run-script build".
