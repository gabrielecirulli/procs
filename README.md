# Procs
A little toy that shows the currently running processes as little balls on a canvas. [Video of it in action](http://pictures.gabrielecirulli.com/v/balls.webm).

It uses Box2D for the physics and Socket.IO to pass the process data to the pages.

![picture](http://pictures.gabrielecirulli.com/Procs-20130909-151908.png)

## What it does
When you open the page you'll see a bunch of balls falling down from the top. Each one of the balls represents a process. Its radius is linked to the amount of memory the app requires to run. Their size can change if the corresponding process allocates more memory (it's very apparent if you, for example, try loading many files at the same time in Photoshop). Some of the balls have a tendency to jump around. If they do, it means the corresponding process is using a big enough slice of CPU.

## How it works
Every 100ms the node process runs `ps` and parses the output. It then sends information about every process over Socket.IO to the page. The page checks for the presence of new processes (using the PID) and, if any are found, it spawns new balls for them.  
If it finds a process is not running anymore, it makes the corresponding ball float towards the top, where it's deleted. It also checks the CPU usage of every process and applies an impulse if it's high enough.

## How to run it
To download it, clone the repository, then `cd` to it in your terminal and run `npm install`. I developed it on node v0.11.6, so it might not run on previous versions. When everything's installed, run `node index.js` and then visit `http://localhost:4000`. Enjoy!

**Please keep in mind that this heavy on the CPU, so don't keep it running for too long if you notice your fans are spinning faster (especially on a MacBook)**

I'm probably going to rewrite this in a lower level language for better performance and less overheating.
