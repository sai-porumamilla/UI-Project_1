In this solo project you will design a mock-up of an interactive user interface for a physical object that has been made digital and 'smart'.  This will be implemented using Svelte and Javascript.  

Digital: we will assume that this object will integrate a digital display and digital controls.
Smart: we will assume that this object will integrate capabilities to sense its usage or environment, and provide features that support to its user.
Mock-up:  We will not be physically constructing these smart objects.  But a digital mock-up on a computer screen will allow you to showcase its features and simulate its use and behavior, to guide an envisioned eventually development plan on a real object.   
Object choice:  In past years students did objects such as showers, mirrors, water bottles, bikes, windows, belt, chair, .... 
The only requirement in choosing your object is that the interactive controls and display cannot be just on one flat surface.  For example, a 'smart desk' interface that includes the desk surface, needs to also incorporate some interface elements on the sides, drawers, etc.  
Project components: 
You will complete this project in several phases:

1. Design (25%): 

Characterizing the affordances (physical properties) of your object
Capturing user needs
Sketching design alternatives to identified challenges (10-plus-10) 
Sketching the interface ("the vanilla sketch")  
Storyboard
Hybrid sketching to illustrate the integration of the interface on a real object
2. Implementation (50%)

3. Documentation of your interface (20%)

4: Presentation (5%)

Project requirements
 Design:
Pre-design needs gathering:
Characterizing the affordances and physical properties of your object:  Referencing our slides on affordances and the Design of Everyday Things, describe the physical properties of your object.  Is it small, large, portable, fixed?  Can you put it in your pocket?  Does it stand up on a table?  
Capturing user needs:  Interview 3 people outside the class (family, friends) about your smart object.  Design interview questions that will help you learn about your user's needs and how your UI can address them.  Report what you learned from these interviews.  
If appropriate for your object, have your interview participants demonstrate how they typically use the object.  (This would not be appropriate or feasible for all objects.)  You can use video/photographs and hybrid sketching to capture this use, just take care to remove identifying information from your user if you post these images in your documentation.
State your assumptions about the smart or sensing features of your object:   
Example: for a smart water bottle, perhaps it measures the water level and temperature, it tracks how much water someone drinks through a sensor in the opening....
Example: for a smart desk, perhaps it can tell when someone is sitting at it, and can record when they leave.  
These should be feasible smart features, but you do not need to describe the technical requirements for how you would achieve them.  
Create a written list of user needs and design requirements for your user interface.  
Example: User needs: User needs to be able to see if the water is cold; Design requirements: Bottle must display water temperature
Sketching (rapid, lightweight implementation):
Sketching design alternatives to 3 design challenges (10-plus-10)
If hard to make 10 full sketches, can do 10 minutes 
Sketching the interface ("the vanilla sketch") - 1 sketch
Storyboard sketch (to be covered in class) - 1 storyboard 
Hybrid sketching to illustrate the integration of the interface on a real object (to be covered in class)  - 1 hybrid sketch
Evaluate (User feedback)
Show your vanilla UI sketch to 3 people (friends, family members, classmates).  Record the feedback.
Implementation 
Level 0:  Partition your page into Device UI and Testing UI:  
Divide your page into regions. 

One region is for prototyping the user interface you envision for your object.   For example, if this were a smart water bottle, you would show the controls, indicators, settings, etc in this area.  Be sure to give space for future project goals (see below).    
The other region is for project information (who are you, what is this project about) and buttons to test usage of your mock object's UI.  For instance, if you want to show the response of your UI to the user taking a drink from the water bottle, you need a button called 'drink'', which will trigger updates in your mock water bottle UI (e.g., water level going down, temperature changes..._)
Be sure to include: 
A title for the project, your name and a link to your project write up.
A graphic to indicate where this UI would reside on the physical smart object.
An info button that, when clicked, explains the controls for simulating the object's use.
Note- the UI for this project does not need to be responsive (work on different screen sizes.  You can generally assume a fixed UI on your smart object, that doesn't need to resize for different displays.  
Level 1:  Basic object UI 
Basic UI:  Begin with the requirements you captured above, and focus on basic controls and usage first.  Create a list of the controls you are including in this UI, the indicators you want display, and how these connect to the design goals you captured. 

For example, if this were a smart microwave project, a Level 0 implementation may include :

Controls: ability to set a timer, ability to select heating mode (e.g. bake / broil / toast / bagel / pizza / convection bake), ability to start the oven.
User needs immediate and appropriate feedback on these actions. 
Display: display the temperature, time and heating mode the user has set; display the current temperature inside the oven (non-updating); display the number of times the user has run the oven that day- increments by one when they start the oven
Design choices: Users need to be able to see the food inside.  Controls will be clustered by major activity. 
 

Levels 2-4 and beyond: 
Choose 1-3 options from the following, based on your object and what interests you most

Option 1. Enable the user to input a complex set of selections: 

The basic interface you implemented for the Level 1 goals may not allow for more complex inputs or user selections.  Design and implement the user interface that will enable your user to input these selections.  
Ensure that they can see their selections clearly, have quick feedback on their selections. 
Examples:
For instance, if you were implementing a smart shower, perhaps you need a sequence of shower temperatures and nozzle settings, with timings, something that is more complex than simple selection within a single menu. 
If you were implementing a smart water bottle, perhaps you need to set water drinking goals for different days of the week.  Perhaps they want to set preferences for whether and how they are alerted about water temperature.
Option 2. Connecting to a mock secondary device.

If one of your design goals involved integrating a secondary device- like a mobile phone or a watch- include a region on your page which will display an interactive UI of the mobile device. 
Examples: For instance, perhaps you are making a smart shopping cart and have a mock-UI for shopping list creation on your phone, which you can load onto your smart shopping cart UI. 
Consider how to show the connection between these devices. 
Consider how interactions in the object UI should update the mock mobile device UI, and vice versa.  
Clearly define in your write-up what the role of the secondary device is, with respect to your smart object. Why have a secondary device?  
Option 3. Display data from sensors or data about usage, for different mock users or situations: 

Since your object is now digital, it can store and compute statistics about its usage.  Since your object may include sensors, it can display statistics about what it senses.  This could involve visualizations or simple SVG graphics or text to display captured data about the object and its use.  

Examples: 

Suppose you were developing a smart toilet and were tracking health-related data.  How would this be visually presented to the user?
Suppose you were developing the UI to a smart shopping cart, if the user has added 10 items to their cart how would you help them see what categories their products are in and how much they cost? 
Specifics: 
Design interface elements that clearly display this captured data
Explain in your documentation what you want to show and why it is valuable to your envisioned users. 
Create 4 scenarios or user profiles that can be selected in the testing area and loaded into your interface.  This will allow us to see how the captured data is displayed for different scenarios or users.  
Option 4. Simulate the smart object in use over a time frame:

If your smart object changes its behavior over time (such as a programmable sequence of events, or events that change as the user engages with it over time), simulate these changes.  There should be a button to activate this simulation- either on your UI or outside it, as appropriate. 
Example 1: Suppose you were implementing a smart shopping cart.  You can't push your UI around a real grocery store. But, if one of your design goals is to highlight where you are in the store, or show coupons for the products near the shopping cart, can you simulate this behavior, in a very simplified store?
Example 2: Suppose you have a programmable shower program- you can include interactions or controls to activate this program, and then show a real-time (or accelerated) version, of how the UI changes as it runs the program. All visual indicators or visual elements should update dynamically as you run your simulation. 
Example 3: For something like the smart water bottle, this might be a simulation of someone drinking water occasionally throughout a simulated period of time, updating the display of how much water they are drinking. You can use a timer and can pre-script the program, to control how the object should change.
5. Propose your own:

It has to be interesting, sufficiently challenging, and it has to involve developing new features in your interactive UI.  I suggest running it by me first. 
Documentation: 
For documentation: assume that someone is encountering your project for the first time. This documentation must be publicly available through your portfolio page. 

Describe the project
Present your design work-
Describe your interface in detail:
Explain the features and controls
Include plenty of screenshots to illustrate your interface and different actions users can perform within it
Explain how you implemented this application (libraries, code structure....)
Future work- No project is ever fully done. What would you do next?  This is also a place to discuss the work you attempted but could not fully complete before the project deadline- include screenshots to illustrate and document your progress. 
AI documentation- describe how you used AI, if you used it. 
Include a 2-3 minute demo video, showing your interface in action. 
The easiest way to record this is with a screen capture tool, which also captures audio- such as Quicktime.  Use a voiceover to explain your application.  Include the name of the project, your name, the project components, and how your application works.  You can present it on your webpage or on youtube, but it must be linked on your webpage. 
Include a link to your source code on github and a link to the publicly hosted application.  
Presentation:
In class: You will give a 5-6 minute talk on your UI to a small group with 1-2 minutes for questions.  You may use slides, videos or live demos to showcase your project.  
Deadlines and timeline
Check-in deadlines:
Object selection: Wed Sept 9 , 11:59pm (choose an object) 

Design check-in:  Mon Sept 21 (submit preliminary version of your design work)

Final deadlines: 
Code: Monday Sept 28, 11:59pm

Documentation: Tuesday Sept 29, 11:59pm

Presentations: Wed Sept 30, in class

 

Suggested timeline: 
Week 1, Sept 2-Sept 9 

Choose an object
Make your github repo for the project, share
Start implementation: Level 0
Week 2, Sept 9-Sept 16

Design: Describe affordances
Design: Interviews
Design: 10-plus-10 sketching, sketch the interface 
Begin Level 1 implementation 
Week 3, Sept 16-Sept 23:

Design: Hybrid sketching
Design: Sketch feedback 
Complete level 1 
Begin Level 2 implementation goals
Week 4, Sept 23-Sept 30

Level 2-4 goals, finish implementation
Finish Documentation
