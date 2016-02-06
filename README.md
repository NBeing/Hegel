# Hegel

Hello, 

Welcome to my WIP MEAN application. 
This application scrapes and repackages my favorite philosophical text, Hegel's Phenomenology of Spirit from the following web resource
and attempts to make it more readable:

https://www.marxists.org/reference/archive/hegel/phindex.htm

If you look at a sample page of the work, for instance the famous Sense Certainty passage (
https://www.marxists.org/reference/archive/hegel/works/ph/phaa.htm) , there are two links contained within each section.
Hegel, being notably abstruse, has many scholarly resources available that attempt to make the Phenomenology more transparent.

This resource currently has a link to Professor Findlay's famous notes for each section, as well as links to a German translation (which are often used by scholars to make sense of philosophical terminology).

While studying Hegel from this resource during my graduate study, I thought it would be cool to have an app that would allow you to 'alt tab' through these contents.

Now that I have the ability to program, I thought it would be a fun project to use as a learning aid.

So, what this program does is, it takes the TOC of the work:
https://www.marxists.org/reference/archive/hegel/phindex.htm

Makes a list of each page (and removes the duplicates).

Scrapes the HTML content of each page (using Cheerio)

Uses a search algorithm to identify paragraphs with links and saves them to a mongo database using a mongoose schema (Cheerio / Mongoose).

A basic API for getting each Hegel section, or associated commentary. 

(For instance : http://localhost:3000/api/hegels/148  ,  http://localhost:3000/api/hegels/findlay/54  )

I've also begun the algorithm for scraping the German text, however this has not been added to the Mongoose database as of yet.
(http://localhost:3000/german this grabs a sample section)

Generates a table of contents using a custom algorithm //
Makes the table of contents into a large object which is then used to populate an angular template.
( explore the page  : http://localhost:3000/api/toc if you would like to look at this object ) 

(Natural route only:: Make a simple UI for browsing the sections. 

Lookup word parts of speech, definitions, and glossary terms using (https://github.com/NaturalNode/natural)
Get wikipedia basic entry using https://github.com/kenshiro-o/wikipedia-js)

The default TOC route works like this (since I have not added the help page yet)

Press T to toggle the TOC
press left/right to navigate the TOC
Press Enter to go to a section you like

Press v to load the findlay commentary (if it exists ~85% complete) 

The first word of the text should be underlined -- if not, hit enter again.
Press 1/2 to scroll. 

Essentially the next step of this project is to create the UI, as well as integrate the Wikipedia and Wordnet lookup functionalities
into the main route. I also want to save the HTML of the text rather than just words.

Note: right now there is a bug where sections do not load above ~190. These are in the database -- it is a UI problem. 

Thanks for checking out my project. I am genuinely interested in exploring the ways in which web technologies
will change acaedemic reading and research habits .

