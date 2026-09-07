# QuickGig 🚀

> **A HYPER-LOCAL, LOCATION-BASED MICRO-GIG MARKETPLACE PLATFORM FOR STUDENTS AND LOW-SKILLED WORKERS**

*Submitted in partial fulfilment of the requirements for the award of the degree of BACHELOR OF TECHNOLOGY in COMPUTER SCIENCE & ENGINEERING (CYBER SECURITY)*

**Submitted By:**
- Vibhu Gupta (2301221720037)
- Priyank Shukla (2301221720021)

**Under the Guidance of:**
Er. Saurabh Bahadur

**Institution:**  
DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING (CYBER SECURITY)  
SHRI RAMSWAROOP MEMORIAL COLLEGE OF ENGINEERING & MANAGEMENT, LUCKNOW  
*Affiliated to Dr. APJ ABDUL KALAM TECHNICAL UNIVERSITY LUCKNOW, UTTAR PRADESH*

---

## 1. INTRODUCTION

### 1.1 General Introduction
The gig economy has emerged as one of the fastest-growing employment models across the world, allowing individuals to earn income through short-term, flexible tasks rather than fixed, long-term jobs. In India, a very large population of college students and semi-skilled or low-skilled workers actively look for small, part-time earning opportunities that fit around their studies or existing commitments. Traditional job portals are largely designed for full-time, skill-intensive employment and are not well suited to advertising or discovering small, one-off tasks such as helping someone move furniture, cleaning a car, tutoring a child for an hour, or picking up groceries. QuickGig is proposed as a web-based platform, built using Next.js on the frontend/backend and MongoDB as the database, that focuses specifically on hyper-local, distance-based discovery of small gigs (odd jobs) so that any person can either post a quick task or accept one that is physically close to them.

The core idea of QuickGig is simple. A user who needs a small job done, for example homework help, running an errand, cleaning a car, minor home repairs, or babysitting for a few hours, can create a 'Gig' along with its location. The platform then uses geolocation to show this Gig only to workers who are within a configurable radius (for example, 10 km) of that location. This ensures relevance, reduces travel overhead for the worker, and increases the chance that the task is completed quickly. Any ordinary person, and not just registered agencies or companies, can post a Gig, which keeps the platform open, informal, and accessible.

### 1.2 Background
Part-time and informal work has always existed in local neighbourhoods, but it has traditionally been coordinated through word of mouth, community notice boards, or informal social media groups such as WhatsApp and Facebook groups. These channels lack structure: there is no reliable way to filter tasks by distance, no verification of the people involved, no tracking of gig status, and no rating mechanism to build trust between strangers. At the same time, students and low-skilled individuals, who often cannot commit to fixed working hours because of classes or other obligations, are underserved by mainstream freelancing platforms such as Upwork or Fiverr, which are oriented towards professional, skill-based, often remote digital work rather than small physical local tasks.

QuickGig attempts to bridge this gap by combining the convenience of a modern web application with a location-first design philosophy. By showing only nearby opportunities, the platform reduces the friction of committing to a task that is too far away, and by keeping the posting process open to any individual (not limited to businesses), it captures the truly informal, everyday nature of local gig work.

### 1.3 Brief Literature Survey
A review of existing platforms shows that most gig/freelance marketplaces fall into one of two categories. The first category consists of large-scale, remote-work oriented platforms (e.g., Upwork, Fiverr, Freelancer) that connect clients and freelancers globally for digital services such as writing, design, or programming; location is largely irrelevant in this category. The second category consists of hyper-local service marketplaces (e.g., UrbanClap/Urban Company, TaskRabbit) that connect customers with vetted, professional service providers for specific categories such as home repair, cleaning, or beauty services; these platforms typically involve a formal onboarding and verification process for service providers and charge a commission, making them less accessible for casual, informal work or for a student wanting to earn a small amount occasionally.

QuickGig is positioned between these two models: like the second category it is location-aware and local, but like an open community board it does not require the poster or the worker to be a professional or a registered business. Any user can flip between being a 'poster' and a 'worker' depending on their need at a given time, which is closer to a peer-to-peer marketplace model than a professional services marketplace.

---

## 2. PROBLEM DEFINITION

Students and low-skilled individuals frequently need small amounts of supplementary income but have limited time, limited professional skills, and limited ability to commit to fixed schedules. On the other hand, many households and small businesses regularly have small, one-off tasks (moving items, minor errands, basic help, short tutoring sessions, cleaning, etc.) for which hiring a full-time employee or a professional agency is unnecessary, expensive, and slow. There is currently no lightweight, trustworthy, and location-aware platform that connects these two groups efficiently for small, short-duration, physically local tasks.

The existing alternatives suffer from the following shortcomings:
*   Informal channels (WhatsApp groups, notice boards) have no distance filtering, no structured gig status, and no accountability.
*   Professional service marketplaces require vetting/registration and are commission-heavy, discouraging casual, occasional workers such as students.
*   Freelancing platforms are oriented towards remote digital work and do not support physical, location-bound micro-tasks.
*   There is no simple mechanism for an ordinary individual to both post a task and discover nearby tasks within the same application.

QuickGig is therefore proposed as a focused solution: a distance/radius-based gig discovery and posting platform where any user can create a small gig with a location, any nearby user can browse and accept gigs within a chosen radius (e.g., 10 km), and both parties can track the status of the gig, communicate, and rate each other after completion.

---

## 3. PROJECT OBJECTIVE

The primary objective of QuickGig is to design and develop a full-stack web application that enables hyper-local discovery and fulfilment of small, part-time gigs based on the geographic proximity between the gig location and the worker's current location. The specific objectives of the project are:
1. To allow any registered user to post a small gig (task) along with a description, category, price/payment offered, and precise location.
2. To allow any registered user to browse and search gigs filtered by distance (e.g., within a user-configurable radius such as 5 km, 10 km, or 20 km) from their current location.
3. To implement a simple, low-friction acceptance flow so that a worker can accept a nearby gig and the poster is notified instantly.
4. To provide a status-tracking mechanism (Open → Accepted → In-Progress → Completed) for every gig so both parties know the current state of the task.
5. To implement a rating and review system so that trust is built over repeated use of the platform.
6. To keep the platform open to any individual (students, homemakers, part-time workers) rather than restricting posting or accepting to verified businesses only.
7. To build the system using a modern, scalable technology stack (Next.js and MongoDB) so that it can be extended in the future with payments, chat, and mobile applications.

---

## 4. PROPOSED METHODOLOGY

QuickGig follows a typical three-tier web application architecture consisting of a presentation layer (Next.js frontend), an application/logic layer (Next.js API routes / Node.js backend logic), and a data layer (MongoDB database), supported by an external geolocation service used to calculate distance between the gig location and the browsing user's current location.

### 4.1 Workflow
The overall proposed path of implementation is described step-by-step below:
1. A new user signs up and logs in; the system captures/permits access to the user's current location (with consent) using the browser Geolocation API.
2. A user who wants a task done navigates to 'Post a Gig', fills in the title, description, category, offered payment, and location (auto-filled from current location or manually pinned), and submits it.
3. The gig document is stored in the MongoDB 'gigs' collection with a GeoJSON location field (2dsphere indexed) so that proximity queries can be executed efficiently.
4. A user browsing for work opens the 'Nearby Gigs' page; the backend runs a geospatial query (`$geoNear` / `$near`) against MongoDB using the user's current coordinates and a selected radius (default 10 km) to return only relevant gigs, sorted by distance.
5. The worker views gig details and taps 'Accept'; the backend creates an Application record, updates the gig status to 'Accepted', and notifies the poster.
6. Both users can view the gig in their dashboard, update its status as work progresses, and mark it 'Completed' once finished.
7. After completion, both parties can rate and review each other, which is stored and used to compute an aggregate trust score shown on user profiles.

### 4.2 Algorithm for Nearby Gig Search
1. Receive the request containing the user's current latitude, longitude, search radius (in km), and optional category filter.
2. Convert the radius from kilometres to radians (radius / 6378.1) as required by MongoDB's `$centerSphere` / `$geoNear` operators.
3. Query the 'gigs' collection using `$geoNear` (or `$near` with a 2dsphere index) with the given coordinates, filtering documents whose status is 'Open' and, if provided, whose category matches the filter.
4. MongoDB uses the 2dsphere geospatial index to efficiently return only the documents that fall within the specified radius, along with a computed distance for each.
5. Sort the returned gigs by ascending distance so that the closest opportunities appear first.
6. Return the paginated result set (title, category, distance, payment offered, poster rating) to the frontend for rendering as a list and/or map view.

---

## 5. TECHNOLOGY STACK AND RELATED CONCEPTS

### 5.1 Next.js
Next.js is a React-based, open-source web framework that supports both server-side rendering (SSR) and static site generation (SSG). Next.js is used to build both the user-facing pages and the backend REST endpoints (via the App Router's route handlers).

### 5.2 MongoDB and Geospatial Queries
MongoDB is a NoSQL, document-oriented database that stores data as flexible BSON documents. A key reason MongoDB is chosen for QuickGig is its native support for geospatial data and queries.

### 5.3 Geolocation and Distance Calculation
The browser's Geolocation API is used to obtain the current latitude and longitude. On the server, MongoDB's geospatial index performs the proximity filtering efficiently.

### 5.4 Authentication
User authentication is implemented using hashed passwords (bcrypt) and stateless session tokens (JWT) via NextAuth, ensuring a secure and minimal sign-up process.

### 5.5 REST API Design
The backend exposes RESTful API routes (`/api/auth`, `/api/gigs`, etc.) returning JSON responses.

### 5.7 Database Schema Design

#### Table 5.1: 'users' Collection
| Field | Type / Description |
|---|---|
| `_id` | ObjectId (Primary Key) |
| `name`, `email`, `phone` | String — basic profile information |
| `passwordHash` | String — bcrypt-hashed password |
| `location` | GeoJSON Point `{type: 'Point', coordinates: [lng, lat]}` |
| `avgRating` | Number — aggregate rating from reviews |
| `createdAt` | Date |

#### Table 5.2: 'gigs' Collection
| Field | Type / Description |
|---|---|
| `_id` | ObjectId (Primary Key) |
| `postedBy` | ObjectId — reference to users collection |
| `title`, `description`, `category` | String fields describing the task |
| `payment` | Number — amount offered |
| `location` | GeoJSON Point, 2dsphere indexed |
| `status` | String — Open / Accepted / In-Progress / Completed |
| `createdAt` | Date |

#### Table 5.3: 'applications' Collection
| Field | Type / Description |
|---|---|
| `_id` | ObjectId (Primary Key) |
| `gigId` | ObjectId — reference to gigs collection |
| `workerId` | ObjectId — reference to users collection |
| `status` | String — Applied / Accepted / Rejected |
| `appliedAt` | Date |

#### Table 5.4: 'reviews' Collection
| Field | Type / Description |
|---|---|
| `_id` | ObjectId (Primary Key) |
| `gigId`, `reviewerId`, `reviewedUserId` | ObjectId references |
| `rating` | Number (1–5) |
| `comment` | String (optional) |
| `createdAt` | Date |

---

## 6. SOFTWARE & HARDWARE REQUIREMENTS

### 6.1 Software Requirements
| Component | Technology / Tool |
|---|---|
| **Frontend Framework** | Next.js (React) with Tailwind CSS |
| **Backend Runtime** | Node.js with Next.js API Routes |
| **Database** | MongoDB (Atlas cloud-hosted / local instance) |
| **Authentication** | JWT / NextAuth with bcrypt password hashing |
| **Geolocation** | Browser Geolocation API + MongoDB Geospatial Queries |
| **Version Control** | Git & GitHub |
| **Deployment** | Vercel (frontend/API) and MongoDB Atlas (database) |

### 6.2 Hardware Requirements (Development Machine)
*   **Processor:** Intel Core i3 (or equivalent) and above
*   **RAM:** 8 GB (16 GB recommended)
*   **Storage:** 256 GB SSD (recommended)

### 6.3 Client-Side (End-User) Requirements
A smartphone, tablet, or computer with a modern web browser and an active internet connection with GPS/location services enabled.

---

## 7. MODULE DESCRIPTION

*   **7.1 User Authentication & Profile Module:** Handles registration, login, and token generation.
*   **7.2 Gig Posting Module:** Geocodes and stores gig data.
*   **7.3 Nearby Gig Discovery Module:** Uses `$geoNear` to return sorted nearby gigs based on user location.
*   **7.4 Gig Acceptance & Status Tracking Module:** Tracks state changes (Open → Accepted → In-Progress → Completed).
*   **7.5 Communication & Notification Module:** Alerts users when status updates occur.
*   **7.6 Rating & Review Module:** Allows 1-5 star ratings post-completion.
*   **7.7 Admin Module:** For moderating flagged content and user disputes.

---

## 9. APPLICATIONS, ADVANTAGES, LIMITATIONS AND PROPOSED COST

### 9.1 Applications
*   Enabling students to earn supplementary income.
*   Helping households quickly find someone nearby for errands.
*   Providing low-skilled workers with a low-barrier entry point to paid work.

### 9.2 Advantages
*   Location-first design saves time and travel cost.
*   Open posting model for any individual.
*   Simple status tracking.
*   Rating system builds local trust.

### 9.3 Limitations
*   Relies on accurate GPS/location data.
*   Initial version does not include integrated online payment processing.
*   No formal identity verification (e.g., government ID check).

### 9.5 Future Scope
*   Integration of a secure, in-app payment gateway (e.g., Razorpay/UPI).
*   Real-time in-app chat using WebSockets.
*   Optional identity verification (Aadhaar/ID-based).
*   A dedicated mobile application (React Native).
*   Machine-learning-based gig recommendations.
