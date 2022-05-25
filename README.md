# IN ORDER TO RUN THIS APP, YOU NEED TO DO THE FOLLOWING: 
(the commands are Windows specific but similiar to Mac and Linux)


## PYTHON SETUP

### 1. CREATE VIRTUAL ENVIRONMENT
    a) `python -m venv env`
    b) 'env\Scripts\activate'

### 2. INSTALL PACKAGES FROM 'requirements.txt'
    => `pip install -r requirements.txt`

### 3. CONNECT TO POSTGRES DATABASE
    For more info: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)

### 4. COMMIT DB CHANGES
    => `py .\manage.py migrate`

### 5. CREATE SUPERUSER
    => 'py .\manage.py createsuperuser'


## REACT SETUP

### 1. INSTALL DEPENDENCIES
    => `npm install`

### 2. CHANGE 'data-user-id' AND 'data-user-username' IN /public/index.html