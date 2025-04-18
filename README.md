# Oxalates Tracker

A comprehensive web application for tracking and managing oxalate intake in your diet. Built with Angular and Firebase, this application helps users monitor their oxalate consumption and make informed dietary choices.

## Overview

Oxalates are naturally occurring compounds found in many foods, particularly plant-based ones. While they can be part of a healthy diet, some individuals need to monitor their oxalate intake due to various health conditions. This application provides tools and information to help users track and manage their oxalate consumption effectively.

## Features

### 1. Oxalate Content Database

- Extensive database of foods with their oxalate content
- Detailed information including:
  - Total oxalate content per 100g
  - Soluble oxalate content
  - Serving sizes
  - Categories
  - Calculation levels (Low to Extremely High)

### 2. Calculation Tools

- Calculate oxalate intake per meal
- Track daily oxalate consumption
- Customize serving sizes
- Save frequently consumed meals
- View historical intake data

### 3. User Features

- Personal profile management
- Save favorite foods and meals
- Track daily intake history
- Password management
- Customizable settings

### 4. Educational Resources

- Information about oxalates
- Tips for managing oxalate intake
- Community support links
- Best practices for dietary management

### 5. Search and Filter

- Search foods by name
- Filter by categories
- Sort by oxalate levels
- View similar food alternatives

1. Clone the repository:

```bash
git clone [repository-url]
cd oxalates
```

2. Install dependencies:

```bash
npm install
```

3. Configure Firebase:

- Create a Firebase project
- Add your Firebase configuration to ``
- Enable Authentication and Firestore in your Firebase console

4. Start the development server:

```bash
ng serve
```

5. Navigate to `http://localhost:4200/` in your browser

## Building for Production

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Acknowledgments

- Data sources for oxalate content
