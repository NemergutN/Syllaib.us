## Inspiration

Every year, nearly 65% of students graduate from college feeling completely blindsided by the job market and unprepared for their professional lives. Not because they lacked ability or effort, but because they lacked direction. 

“Why am I doing this?” and “What am I doing wrong?” aren’t just expressions of frustration, but rather indications of a larger issue: we’ve built a system where education and career preparation are treated as two separate paths. A system that fails students from all over the nation. 

## What it does

We didn’t create a resume builder. This isn't another LinkedIn. This is the first time a student can look at their course load and see their career reflected back at them– personalized, specific, and actionable from day one. 

Through SyllAib.us, we aimed to capture the dynamics and constantly shifting priorities of students’ learning journeys, and how every step in it, down to the courses chosen to be taken, affects the opportunities students qualify for and are presented in the future. It turns a static syllabus into an interactive, data-driven career roadmap that guides students to be more intentional in their current decisions to reskill and learn, based on their current skills and career goals.

The experience starts with the user simply uploading a PDF of the syllabus to the system. SyllAib.us then parses important logistical information–professor’s office hours, grading breakdowns, the # of quizzes and exams to be expected within a semester–and displays it in a clean, easy-to-manage dashboard. Multiple PDFs can be uploaded, with all of ur courses being presented and available to you at your convenience. 

But SyllAib.us isn’t just a syllabus parser. By entering your major and career goals on your dashboard, the system will then act as a mentor to develop the most optimized roadmap to get to where you want to be, from where you are now, beautifully visualized in the form of a knowledge map. 

SyllAib.us constantly updates your strengths and areas of concern, the more it finds out about you. By utilizing APIs, the dashboard also displays targeted internships and occupations that users can pursue, no matter where they are in their learning journey.

## How we built it

We were intentional in building our pipeline for the agent to aggregate data to the user specific to their goals. We were careful in balancing the incorporation of Large Language Models that generated text with API calls that pulled factual information, to make sure the data pipeline presented the user with relevant information. 

We built the app using the Nextjs framework to create a fullstack application using node as backend and react as frontend, and we connected MongoDB to the application. We were careful to make sure the neatness and minimality of the UI reflected the recluse the app intended to be where the user can calm and collect themselves. 

## Challenges we ran into
Everything.

Kidding! But there definitely were a ton of roadblocks along the way. Some challenges include:

Database set up: 
+ Identifying the data that had to be stored in the database, and the schema that allowed for best data traversal and transformation
+ Setting up a MongoDB database storing user information, connecting it with the frontend

APIs: 
+ Figuring out how to use new apis
+ Bypassing the rate limits posed by the different apis that we had integrated 
