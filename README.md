
# Global optimization tool
This is a tool that enables you to take the global minimum of the given function. Create using JavaScript and React.

Released methods:
1) Hooke-Jeeves method (optionally with multistart method);
2) Swarm optimization;
3) Simulated annealing (SA);
4) Genetic algorithm;
5) Tabu-Search method (optionally with my modification which includes SA in the algorithm).
	
A function should be of no more than 9 different variables. 
	
To name a variable you need to call it like 'x<number from 1 to 9>'. For example, correct function input would be 'x1^2+2*x1*x2+x2^2'.
	
Some of the textboxes of the tool take input in vector form. For example if the given function is of 2 variables then the upper boundary parameter may be '10 10' and lower boundary '-10 -10'.
Variables in the lower boundary should be less than variables in the upper boundary.
Following image is an example of the of how you should set parameters for Hooke-Jeeves method:
![example](https://user-images.githubusercontent.com/68156110/128552863-0b19508b-69c1-4d6f-a757-4cd54ae95940.PNG)

# Development
Here "terminal" means Windows Command Prompt (cmd). You may use Terminal in Linux as well.
Requirements: node.js packet manager (npm).

1. Clone the repository;
2. Change directory in terminal to that cloned on your computer; 
3. Install dependencies by executing "npm install" in terminal;
4. "npm start" to start development. 

"npm start" will create a local server at localhost:3000. Now you may change files in "src" folder and immediately see result at the local server.

To build project you should run command "npm run-script build".
