# e-Cognita Server


## REST API


### Authentication
The server uses basic authentication. 
With each request you have to send an authentication header:

Example:
```http
Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==
```


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


### Get all courses
Gets list of all available courses

**Request:**
```httph
GET /api/courses/
```

**Response:**
```httph
Status:
200 OK
```


### Get course
Gets a course by id

**Request:**
```httph
GET /api/courses/:id
```

**Response:**
```httph
Status:
200 OK
```


### Get authored courses
Get list of courses which the authenticated user is the author for.

**Request:**
```httph  
GET /api/account/authored  
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


### Enroll for a course
Enroll for a course

**Request:**
```httph
POST /api/account/enrolled/:id

params:  
id       Course ID for which the user is enrolling    
```

**Response:**
```httph
Status:
204 No Content      - Successfully enrolled
400 Bad Request     - Course not found
```


### Get enrolled courses
Get list of courses which the user is enrolled for.

**Request:**
```httph
GET /api/account/enrolled
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


### Leave a course
Leave a course

**Request:**
```httph
DELETE /api/account/enrolled/:id

params:  
id       required    (ID of the course to be left)
```

**Response:**
```httph
Status:
204 No Content      - Successfully left the course
404 Not Found       - Course not found in user's enrollments or user is already enrolled in that course.
```


### Create new quiz
Creates a new quiz
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
            "question": "First question?",
            "choices": [ "Answ1", "Answ2" ],
            "correct": "1"
        },
        {
            "question": "Another quesion?",
            "choices": [ "Answ3", "Answ4" ],
            "correct": "0"
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


### Get quiz by ID
Gets a quiz by ID

**Request:**
```httph
GET /api/quizzes/:id
Accept: application/json

params:  
id       Quiz ID    
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
    "date_created": "2015-06-09T14:09:51.989Z",
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
        "question": "First question?",
        "choices": [
            "Answ1",
            "Answ2"
        ]
    },
    {
        "id": "5576f3aff5d8953417ce1825",
        "question": "Another quesion?",
        "choices": [
            "Answ3",
            "Answ4"
        ]
    }
]
```


### Publish Quiz
Publishes a quiz and notifies all subscribed users.

**Request:**
```httph
POST /api/quizzes/:id/publish
Content-Type: x-www-form-urlencoded

form-data:  
message        required    (Text message to the subscribers)  


params:  
id       ID of quiz to publish
```

**Response:**
```httph 
Status:
200 OK      - Quiz successfully published.
```


### Close Quiz
Closes a quiz and notifies all subscribed users.

**Request:**
```httph
POST /api/quizzes/:id/close
Content-Type: x-www-form-urlencoded

form-data:  
message        required    (Text message to the subscribers)  


params:  
id       ID of quiz to publish
```

**Response:**
```httph 
Status:
200 OK      - Quiz successfully closed.
```


### Subscribe user for receiving notifications
Subscribes a user to receive push notifications

**Request:**
```httph
POST /api/account/subscriptions/:token

params:  
token   (Push notification token)  
```

**Response:**
```httph 
Status:
204 No Content      - Account successfully subscribed.
```


### Unsubscribe user for receiving notifications
Unubscribes a user to receive push notifications

**Request:**
```httph
DELETE /api/account/subscriptions/
```

**Response:**
```httph 
Status:
204 No Content      - Account successfully unsubscribed.
```


### Submit solution
**Request:**
```httph
POST /api/quizzes/:id/solutions

params:  
id       Quiz id    
```

**Example Request Body**
```json
[
    {
        "question_id": "55776494d01118ec0cfdfc0f",
        "selected": 1
    },
    {
        "question_id": "66776494d01118ec0cfdfc0f",
        "selected": 0
    }
]
```

**Response:**
```httph 
Status:
204 No Content      - Solution successfully submitted.
403 Forbidden       - Quiz is closed or a solution has already been submitted by this user.
```


### Get all quiz solution
**Request:**
```httph
GET /api/quizzes/:id/solutions

params:  
id       Quiz ID   
```

**Response:**
```httph 
Status:
200 OK
```

### Get account statistics
**Request:**
```httph
GET /api/account/statistics/:stat_type

params:  
stat_type       - Statistics type  
  options:
    avg         - Comparison between user's score and the average score for each quiz
```

**Response:**
```httph 
GET /api/account/statistics/avg

Status:
200 OK
```

```json
[
    {
        "quiz": {
            "id": "55952ac12448901100c3eb3f",
            "title": "Some Random Quiz"
        },
        "user_score": 0.3,
        "average_score": 0.7
    },
    {
        "quiz": {
            "id": "55958b5a5b3bc1743a9e7804",
            "title": "Server Technologies"
        },
        "user_score": 1,
        "average_score": 1
    }
]
```


### Get user scores
*Request*
```httph
GET /api/account/scores
```

*Response*
```json
[
    {
        "quiz": {
            "id": "55958b5a5b3bc1743a9e7804",
            "title": "Server Technologies"
        },
        "score": 1
    }
]
```


### Get user score for quiz
*Request*
```httph
GET /api/account/scores/:quiz_id
```

*Response*
```json
{
    "score": 1
}
```


### Get grade distribution
*Request*
```httph
GET /api/statistics/:quiz_id/grade_distribution

params:
quiz_id - ID of the quiz
```

*Response*
```json
{
   "quiz_id":"559e56a52da51d1100febd1c",
   "quiz_title":"Quiz 1",
   "total_participants":1,
   "grade_distribution":[
      {
         "score":0,
         "count":0
      },
      {
         "score":0.1,
         "count":0
      },
      {
         "score":0.2,
         "count":0
      },
      {
         "score":0.3,
         "count":1
      },
      {
         "score":0.4,
         "count":0
      },
      {
         "score":0.5,
         "count":0
      },
      {
         "score":0.6,
         "count":0
      },
      {
         "score":0.7,
         "count":0
      },
      {
         "score":0.8,
         "count":0
      },
      {
         "score":0.9,
         "count":0
      }
   ]
}
```
