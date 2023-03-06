# Bharath-Karthik-Keerthana-Nikhil-Sandhya-Tanisha

Team Members:

    Bharath Kumar Bandaru - bbandaru@asu.edu

    Karthik Chowdhary Nelapati - Knelapa1@asu.edu

    Keerthana Golusula - kgolusul@asu.edu

    Nikhil Sagar Miriyala - nmiriya1@asu.edu

    Sandhya Balaji - sbalaj17@asu.edu

    Tanisha Tembhre - ttembhre@asu.edu


Steps to run the code:

    1. Clone this code to your local machine.

    2. Using a local server such as Python HTTP Simple Server(use command: python -m http.server), open the index.html file.


Dataset:

Tweets data is extracted using a python library provided by twitter called tweetrPy. It returns the tweets based on our query.
The query we used for the API for this project is query=<Location September>, and limited for 14 locations (all are US states).
We also used DataFinder for tweet extraction and performed data clean-up like tokenization and stop word removal. We performed keyword extarction using Yake, identified common keywords using Union Find algorithm, did sentiment analysis using Bert model and category prediction using Logistic Regression.

The resulting dataset has the following structure:
    
    1. final_keywords_list.csv : has events data with attributes event_id, location, date, tweets_count, keywords, event_sentiment,classification, Common_keywords_id
    
    2. final_tweets_list.csv : has tweets data with attributes event_id, event_id2, tweets, location,date
    
    3. final_keywords_list.csv: has keywords data with attributes event_id,keyword,weight,location,date
  
Main Visualization:
    
When the main page loads, all six views have visualization representing whole data. 
    
    1. Calender View : Gives information of events on particular date and connects the events based on location and keywords

    2. Map view: Gives information of events at particular location and how far the event is from today's date.

    3. Word Cloud: Gives information of keywords of the events. This can be filtered according to events of a date, location or individual event.

    4. Network view: Gives the information of popularity of events in a location based on number of tweets per event.

    5. Tweet Panel: Provides the tweets related to events based on selection made in other panels.

    6. Categoery view: Provides information about distribution of events among different categories at particular location.
 
Filtering of views based on location, dates, events and keywords cane be observed by using the hover and clickable functionalities in each view.
    
Project code Structure:
    
      Data folder - All csv data files.

      DataPreprocessing folder - Python code files 

      index.html - Main page view

      index.css - For styling the views

      js/panelA.js - Calender View 

      js/map.js - Map View 

      js/PanelC.js - Word Cloud View

      js/PanelD.js - Social Network View

      js/PanelE.js - Tweet Panel View

      js/PanelF.js - EVents Category View (Extension)
    
  All the interactions and functionalities are added in the javascript files.
    




