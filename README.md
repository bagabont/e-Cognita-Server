# e-Cognita Server

## REST API

### Register user
Registers a user

**Request:**

```httph
POST /api/users
Content-Type: x-www-form-urlencoded

form-data:  
email       required    (valid email)  
password    required    (min 3 chars)  
fistname    required    (min 1 char)  
lastname    optional  
```

**Response:**

```httph 
Status:
201 Created     - User successfully created
409 Conflict    - User already exists.  
```

### Create new course
Creates a new course.

**Request:**
```httph
POST /api/courses
Content-Type: x-www-form-urlencoded

form-data:  
title           required, unique    (min 1 char)  
description     required            (min 1 chars)  
```

**Response:**
```httph
Status:
201 Created     - Course successfully created
409 Conflict    - Course already exists
```

### Get authored courses
Get list of courses which the authenticated user is the author for.

**Request:**
```httph  
GET /api/courses/authored  
Accept: application/json 
```

**Response:**
```httph
Status:
200 OK
```

```json

[
    {
        "id": "557696342886b96832a4842f",
        "title": "Some Title",
        "description": "Info about the course."
    },
    {
        "id": "5576a95fa68224581ff11da6",
        "title": "Another Title",
        "description": "Useful information."
    }
]
```

### Get enrolled courses
Get list of courses which the authenticated user is enrolled for.

**Request:**
```httph
GET /api/courses/enrolled  
Accept: application/json  
```

**Response:**
```httph
Status:
200 OK
```

```json
[
    {
        "id": "557696342886b96832a4842f",
        "title": "Some Title",
        "description": "Info about the course."
    },
    {
        "id": "5576a95fa68224581ff11da6",
        "title": "Another Title",
        "description": "Useful information."
    }
]
```

### Create new quiz

**Request:**
```httph
POST /api/quizzes
Content-Type: application/json
```

**Request Body Example:**
```json
{
    "title": "Server Technologies",
    "description": "Show your skills and knowledge!",
    "course_id": "5576ee13170cb4cc2abb8ed2", 
    "questions": [
        {
            "text": "First question?",
            "answers": ["Answ1",  "Answ2"],
            "correctAnswerIndex": "1"
        },
         {
            "text": "Another quesion?",
            "answers": ["Answ3", "Answ4"],
            "correctAnswerIndex": "0"
        } 
    ]
}
```

**Response:**

```httph
Status:
201 Created         - Quiz successfully created.
400 Bad Request     - Invalid or missing parameters.
```

### Get quiz

**Request:**
```httph
GET /api/quizzes/:id
Accept: application/json
```

**Response:**
```httph
Status:
200 OK
```

**Response Content Example:**
```json
{
    "id": "5576f3aff5d8953417ce1824",
    "created": "2015-06-09T14:09:51.989Z",
    "course_id": "5576ee13170cb4cc2abb8ed2",
    "title": "Server Technologies",
    "description": "Show your skills and knowledge!"
}
```

### Get all course quizzes
Gets all quizzes which are associated to the given course ID.

**Request:**
```httph
GET /api/quizzes
Content-Type: application/json

query parameters:
course_id   
```

**Response:**
```httph
Status:
200 OK
```

**Response Content Example:**
```json
[
    {
        "id": "5576f3aff5d8953417ce1824",
        "created": "2015-06-09T14:09:51.989Z",
        "course_id": "5576ee13170cb4cc2abb8ed2",
        "title": "Server Technologies",
        "description": "Show your skills and knowledge!"
    }
]
```

### Get quiz questions
**Request:**
```httph
GET /api/quizzes/:id/questions
Content-Type: application/json
```

**Response:**
```httph
Status:
200 OK
```

```json
[
    {
        "id": "5576f3aff5d8953417ce1826",
        "text": "First question?",
        "answers": [
            "Answ1",
            "Answ2"
        ]
    },
    {
        "id": "5576f3aff5d8953417ce1825",
        "text": "Another quesion?",
        "answers": [
            "Answ3",
            "Answ4"
        ]
    }
]
```