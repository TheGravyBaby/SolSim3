Solsim is a project that allows users to explore the beauty of orbital mechanics with interactive and simple tools. 

This iteration - perhaps the final frontier ;) - uses the power Go concurrency to create a high performant backend that 
can support large systems at high calculation grainularity. The front end is powered by Angular and D3, finally featuring
a fully three dimensional rendering system with a dynamic camera. 

![image](https://github.com/TheGravyBaby/SolSim3/assets/56764494/3aac74b6-2f58-45d3-b30b-7f1f3d2cf263)
![image](https://github.com/TheGravyBaby/SolSim3/assets/56764494/71884cd0-8054-4572-b19b-54ba73121801)

Work in progress, currently chasing feature parity with SolSim2 where users can add and edit bodies easily. Once we're there, 
the plan is to add verlet integratoin as well as collisions. 

I also intend to add a docker image as well as a hosted server at some point, but for now, here's how to get started until then. 

1. Download the repo.
2. "go install" then "go run main.go" in the server folder.
3. "npm install" along with "npm install angular/cli" then run an "ng serve"
4. Go to localhost:4200 to run the app! :D
