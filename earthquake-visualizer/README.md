🌍 Earthquake Visualizer
📖 Overview

The Earthquake Visualizer is a web application that displays real-time global earthquake activity on an interactive map using the USGS Earthquake API.
It allows users to filter earthquakes based on magnitude and view details like location, magnitude, and time.

👩‍💻 Built For

Casey, a geography student who wants to study global seismic patterns interactively.

⚙️ Tech Stack

Frontend Framework: React

Styling: CSS

Map Library: Leaflet & React-Leaflet

Data Source: USGS Earthquake API

HTTP Client: Axios

🚀 Features

🗺️ Interactive world map showing real-time earthquakes

🌈 Color-coded markers (based on magnitude)

Green → Minor (< 3.0)

Orange → Moderate (3.0–4.9)

Red → Strong (≥ 5.0)

🔍 Magnitude filter input box

🕒 Popup details (location, magnitude, and time)

🔗 API Used

USGS Earthquake API
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson

🧠 How It Works

Fetches live earthquake data from the USGS API.

Displays markers on a Leaflet map.

Filters visible earthquakes based on user input for minimum magnitude.

Each marker shows detailed info on click.

🧰 Installation & Setup

Clone or download this project

Open the folder in your terminal

Run the following commands:

npm install
npm start


Then open http://localhost:3000 in your browser.

🧪 Example

Try setting:

Magnitude 0 → All earthquakes

Magnitude 4 → Only moderate & severe ones

👨‍🎓 Developer

Keshuvardhan Vuddanti