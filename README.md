# Inventory Management System

## Project Description

The **Inventory Management System** is a software application designed to manage and monitor inventory efficiently. The system allows authorized users to login, add and manage products, maintain product categories, manage suppliers, track stock levels, record stock-in and stock-out transactions, and view inventory reports. The administrator can manage users, products, suppliers, inventory records, and system activities.

## Team Members

1. Student 1

2. Student 2

3. Student 3

4. Student 4

## Technologies

* HTML
* CSS
* JavaScript
* Java/Python/Node.js
* MySQL

## Project Structure

```text
inventory-management-system/

│
├── README.md
│
├── docs/
│   ├── SRS/
│   └── UML/
│
├── src/
│   ├── frontend/
│   └── backend/
│
├── test/
│
└── .gitignore
```

Software Engineering involves several activities such as requirements analysis, design, coding, testing, version control, and project management.

Different tools are used for different activities.

| Activity                   | Example Tools                   |
| -------------------------- | ------------------------------- |
| Requirements Documentation | MS Word, Google Docs            |
| UML Design                 | Draw.io, StarUML                |
| Programming                | VS Code, IntelliJ IDEA, Eclipse |
| Version Control            | Git                             |
| Code Repository            | GitHub                          |
| Project Management         | GitHub Projects, Trello         |
| API Testing                | Postman                         |
| Database                   | MySQL, PostgreSQL, MongoDB      |
| Testing                    | JUnit, PyTest                   |
| Documentation              | Markdown, MS Word               |

# Experiment 1: Introduction to Software Engineering Tools and Project Setup

**Select a real-world software project, form the project team, create the GitHub repository, and demonstrate repository creation and basic version control operations for the selected project.**

## Aim

To select a real-world **Inventory Management System**, form a project team, create a GitHub repository, and demonstrate basic Git and GitHub version control operations.

## Objectives

* Select an appropriate real-world software project.
* Define project team roles and responsibilities.
* Create a GitHub repository.
* Create the initial project structure.
* Perform basic Git operations such as add, commit, push, pull, and status.
* Understand collaborative software development using GitHub.
* Understand the basic workflow of an inventory management application.

## Tools Required

| Tool                            | Purpose                                      |
| ------------------------------- | -------------------------------------------- |
| **Visual Studio Code**          | Creating and managing project files          |
| **Git**                         | Version control and tracking project changes |
| **GitHub**                      | Remote repository and team collaboration     |
| **Web Browser**                 | Accessing GitHub and managing the repository |
| **Git Bash / VS Code Terminal** | Executing Git commands                       |

## Introduction

**Git** is a distributed version control system used to track changes in source code. **GitHub** is a cloud-based platform used to host Git repositories and support collaborative software development.

Version control helps developers maintain project history, collaborate with team members, manage different versions of software, and recover previous versions when required.

The basic Git workflow is:

```text
Working Directory

       ↓

    git add

       ↓

Staging Area

       ↓

   git commit

       ↓

Local Repository

       ↓

   git push

       ↓

Remote Repository (GitHub)
```

# Problem Statement

Develop an **Inventory Management System** using Software Engineering principles. Create a GitHub repository for the project, organize the project team, create the initial project structure, and demonstrate essential Git operations.

The system should provide an organized way to manage products, inventory levels, suppliers, and stock transactions. It should help users maintain accurate inventory records and allow administrators to monitor and manage the overall inventory.

# Selected Project

**Project Title:** Inventory Management System

**Domain:** Inventory / Stock Management

**Objective:** Develop an inventory management application that allows authorized users to login, add and manage products, manage product categories and suppliers, track available stock, record stock-in and stock-out transactions, monitor low-stock products, and generate inventory-related reports. The administrator can manage users, products, suppliers, inventory records, and system activities.

# Major Features

### 1. User Authentication

* User registration and login.
* Secure authentication.
* Role-based access for administrators and staff.
* Logout functionality.

### 2. Product Management

* Add new products.
* Update product information.
* Delete products.
* Search and view products.
* Maintain product price and quantity information.

### 3. Category Management

* Add product categories.
* Update categories.
* Delete categories.
* View products according to categories.

### 4. Supplier Management

* Add supplier details.
* Update supplier information.
* Delete suppliers.
* View supplier records.

### 5. Inventory Management

* Track available stock.
* Record stock received.
* Record stock issued.
* Update inventory quantities.
* Monitor current stock levels.

### 6. Stock Alerts

* Identify products with low stock.
* Display low-stock warnings.
* Help administrators maintain sufficient inventory.

### 7. Inventory Reports

* View current inventory.
* View stock-in records.
* View stock-out records.
* Generate inventory-related reports.
* Analyze inventory status.

# Project Team

| Role               | Responsibility                           | Member    |
| ------------------ | ---------------------------------------- | --------- |
| Project Manager    | Planning and coordination                | Student 1 |
| Backend Developer  | Business logic, database and APIs        | Student 2 |
| Frontend Developer | User interface and frontend development  | Student 3 |
| Tester             | Testing, bug reporting and documentation | Student 4 |

# Project Setup

Create the following project structure in VS Code:

```text
inventory-management-system/

│
├── README.md
│
├── docs/
│
├── src/
│
├── test/
│
└── .gitignore
```

# Repository Creation Steps

1. Create a GitHub account and sign in.
2. Click **New Repository**.
3. Repository Name: `inventory-management-system`
4. Add a `README.md` file.
5. Choose **Public** or **Private** visibility.
6. Click **Create Repository**.
7. Add the team members as collaborators.
8. Clone the repository to the local system.
9. Open the project in VS Code.
10. Create the initial project folders and files.

# Basic Git Commands

| Operation                 | Command                                  |
| ------------------------- | ---------------------------------------- |
| Check Git version         | `git --version`                          |
| Initialize repository     | `git init`                               |
| Check status              | `git status`                             |
| Add files                 | `git add .`                              |
| Commit changes            | `git commit -m "Initial project setup"`  |
| Connect remote repository | `git remote add origin <repository-url>` |
| Rename branch             | `git branch -M main`                     |
| Push changes              | `git push -u origin main`                |
| Pull latest changes       | `git pull origin main`                   |
| View history              | `git log --oneline`                      |

# Version Control Demonstration

### Step 1: Initialize the local repository

```bash
git init
```

### Step 2: Check the repository status

```bash
git status
```

### Step 3: Add project files to the staging area

```bash
git add .
```

### Step 4: Create the first commit

```bash
git commit -m "Initial project setup"
```

### Step 5: Connect the local repository to GitHub

```bash
git remote add origin <repository-url>
```

### Step 6: Push the project to GitHub

```bash
git branch -M main
git push -u origin main
```

### Step 7: Make a change in README.md, then stage and commit it

```bash
git add .
git commit -m "Update project documentation"
```

### Step 8: Push the latest changes

```bash
git push
```

### Step 9: View the commit history

```bash
git log --oneline
```

### Step 10: Obtain changes made by other team members

```bash
git pull origin main
```

# Repository Structure

```text
inventory-management-system/

│
├── README.md
│
├── docs/
│   ├── SRS/
│   └── UML/
│
├── src/
│   ├── frontend/
│   └── backend/
│
├── test/
│
└── .gitignore
```

**README.md** – Contains project description, features, setup instructions, and basic project information.

**docs/** – Contains project documentation such as SRS and UML diagrams.

**docs/SRS/** – Contains the Software Requirements Specification documents.

**docs/UML/** – Contains UML diagrams such as use-case, class, sequence, and activity diagrams.

**src/** – Contains the source code of the application.

**src/frontend/** – Contains the user interface and frontend code.

**src/backend/** – Contains business logic, APIs, database connectivity, and server-side code.

**test/** – Contains testing files and test cases.

**.gitignore** – Contains files and folders that should not be tracked by Git.

# Expected Outcome

The GitHub repository should contain the initial **Inventory Management System** project structure, README file, documentation folders, source-code folder, testing folder, and Git version history.

All team members should be able to access the repository and collaborate using GitHub.

The project should provide a structured platform for managing products, suppliers, inventory quantities, stock transactions, and inventory reports.

# Observation

Git and GitHub provide an effective mechanism for maintaining software versions and collaborating among team members.

The Working Directory, Staging Area, Local Repository, and Remote Repository form the basic Git workflow.

The **Inventory Management System** provides a real-world application of Software Engineering principles by combining requirements analysis, system design, implementation, database management, testing, documentation, and version control.

# Result

An **Inventory Management System** project was successfully selected and the project team was formed. A GitHub repository was created, the initial project structure was established, and basic Git version-control operations including **add, commit, push, pull, status, and log** were successfully demonstrated.

The project provides a foundation for developing an inventory management application that can manage **products, categories, suppliers, stock levels, stock transactions, users, and inventory reports**.
