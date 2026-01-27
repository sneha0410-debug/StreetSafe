# 🛡️ StreetSafe – A Support Platform for Homeless Individuals

StreetSafe is a location-based web platform that helps homeless individuals, volunteers, and social workers find nearby shelters, hospitals, and emergency resources easily.

---

## 🌍 Problem Statement

Homelessness in India is a growing crisis. Many individuals are forced to live on the streets due to poverty, unemployment, abuse, abandonment, or lack of affordable housing. Access to basic necessities—such as shelter, healthcare, and legal support—is extremely limited for homeless populations.

Children living on the streets are especially vulnerable to exploitation, forced labor, trafficking, and violence. Despite the presence of NGOs and government helplines, information is often fragmented and hard to access at the right time.

---

## 💡 Purpose of StreetSafe

StreetSafe aims to bridge this gap by providing a simple, location-aware platform that centralizes critical resources for people in need.

The platform enables users to:

-Locate nearby shelter homes
-Find the nearest hospitals
-Access verified legal aid and emergency helpline numbers
-View a curated list of essential survival items

Intended users:

-Homeless individuals
-Social workers
-NGOs
-Volunteers
-Government awareness teams

---

## ⭐ Key Features

### 🏠 1. Nearby Shelter Homes
Uses Leaflet.js with OpenStreetMap to show nearby shelters based on the user’s real-time location.

### 🏥 2. Nearby Hospitals
Displays nearest medical facilities using Leaflet maps and location coordinates.

### 📦 3. Street Survival Kit
Provides a list of essential items required to survive on the street and includes necessities like clothes, toiletries, sleeping gear, etc.

### ⚖️ 4. Legal Aid & Helplines
Legal aid contacts for reporting exploitation, abuse, or child trafficking.

---
🚧 Project Status

StreetSafe is currently an MVP (Minimum Viable Product).

Core location-based features are implemented. Future iterations will focus on real-time data integration, NGO collaboration, and scalability.

---
## 🚀 Future Enhancements

### 🔄 Real-Time Data Through IoT
IoT sensors placed near public areas could help detect people in need and automatically notify nearby shelter homes about availability.

### 🤝 Collaborations with NGOs
Plans to integrate and collaborate with:

- Salaam Baalak Trust  
- Aashray Adhikar Abhiyan  
- URJA Trust  

These organizations already work with homeless individuals and can support with data sharing, rescue operations, and rehabilitation.

---

## 🛠️ Tech Stack

### Frontend
- Next.js (React Framework)  
- Tailwind CSS for styling  

### Maps
- Leaflet.js for interactive maps  
- OpenStreetMap tiles  

### Backend / Authentication
- Supabase (Database & backend services)  
- Clerk (User authentication)  

### APIs & Services
- HTML5 Geolocation API  
- Leaflet map rendering & markers  

---
## ⚙️ Getting Started

### Prerequisites :
-Node.js
-npm or yarn

### Installation :
git clone https://github.com/sneha0410-debug/streetsafe.git
cd streetsafe
npm install

### Environment Variables :

Create a .env.local file and add your Supabase and Clerk credentials.

### Run Locally :
npm run dev

Open http://localhost:3000 in your browser.

---
## 🤝 Contributions

Contributions, ideas, and feedback are welcome. This project is built with the intention of creating real-world social impact.


