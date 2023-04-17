## AWS CONNECT ADMIN DASHBOARD

---

**TOC**

1. Installation
   1. Prerequisite
      1. Software environment
      2. Server environment
   2. Cloning repository
   3. Installing dependencies
   4. Setting up environmental variables
   5. Populating database
   6. Creating initial admin user
   7. Managing Logs
2. Running and Stopping application
3. Monitoring
4. Maintenance and Troubleshooting
   1. Setting user type
   2. Removing user
   3. Resetting password
5. FAQ
   1. Database
   2. Application runtime logs

## 1. Installation
### 1.1 Prerequisite
#### 1.1.1 Software Environment
```bash
node >= v16.18.0
npm >= v8.19.2
```
#### 1.1.2 Server Environment
```bash
Amazon Linux 2 AMI
```

### 1.2 Cloning repository

Clone or copy the project directory named "awsconnectdashboard" to the sever home directory or workspace.

 
### 1.3 Installing dependencies

Change directory to "awsconnectdashboard" from terminal/console/command-prompt and install npm dependencies.

```bash
cd awsconnectdashboard
npm install
```

  **Rest of the setup instruction will assume that your present working directory (PWD) is ```path/to/awsconnectdashboard```**

### 1.4 Setting up environmental variables

```bash
mv dot-env-template .env
```

Set variables in .env except ```DEFAULT_OUTBOUND_QUEUE_ID``` and ```CONTACT_FLOW_ID```. Instructions are given below to retrieve values of ```DEFAULT_OUTBOUND_QUEUE_ID``` and ```CONTACT_FLOW_ID```.

To edit ```.env``` file -

```bash
nano .env
```
or 
```bash
vi .env
```

Now set the values inside ```.env```, for example:

```bash
ACCESS_KEY_ID=SECRET
SECRET_ACCESS_KEY=SECRET
REGION=SECRET
INSTANCE_ID=SECRET
AWS_RETRY_MODE=standard
SESSION_SECRET=32_char_long_random_key
PAGE_COMPRESS=1
ROUTING_PROFILE_PREFIX=automated_rp_
DEFAULT_OUTBOUND_QUEUE_ID=SEE_BELOW
PORT=3000
PAUSE_BETWEEN_API_CALL_IN_SERVER=500
PAUSE_BETWEEN_API_CALL_IN_CLIENT=500
CDR_DATA_ACQUISITION_INTERVAL=1200000
CONTACT_FLOW_ID=SEE_BELOW
LOG_LEVEL=info # Other possible values: error, warn, info, debug
```

Run the following to get a list of available queues and select one to set ```DEFAULT_OUTBOUND_QUEUE_ID```.  

```bash
node utilities/listqueues.js
```

To set ```CONTACT_FLOW_ID```, collect the value from Cnnect Admin Panel.


### 1.6 Populating database
Run the application once to create necessary DyanamoDB tables and populate them with initial values.

```bash
npm run pm-loc-start
```
And then stop the application by following command until the rest of the setup process is complete.

```bash
npm run pm-loc-stop
```


### 1.7 Creating initial admin user

To create the initial Admin User, run the following command -

```bash
npm run create-first-user
```

_Above will create a default admin user named_ ```admin``` _and password for the user_ ```admin123```

**Please change the default password after first login for security purpose.**

### 1.8 Managing Logs
Run the following commands to setup log file manager. It will allow to set policy of log file size and rotation interval.

```bash
./node_modules/pm2/bin/pm2 install pm2-logrotate
./node_modules/pm2/bin/pm2 set pm2-logrotate:max_size 1K # 20G, 15M, 1K etc
./node_modules/pm2/bin/pm2 set pm2-logrotate:rotateInterval '*/1 * * * *'
```

Format of rotateInterval is as below -
```bash
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```


## 2. Running and Stopping application

To run the application and manage the system process, use the following command -

```bash
npm run pm-loc-start
```

And to stop, run - 

```bash
npm run pm-loc-stop
```

## 3. Monitoring

To view application generated logs, run -

```bash
npm run pm-loc-logs
```

To view application process status, run -

```bash
npm run pm-loc-status
```

## 4. Maintenance and Troubleshooting

### 4.1 Setting user type
From admin console, open table ```CloudCall_User``` and change the value of the key ```admin``` to set type of any user.

```admin=0```, for Agent or Non-Admin user.
```admin=1```, for Admin user.

### 4.2 Removing user

From admin console, open table ```CloudCall_User```. Find and delete the desired user.

### 4.3. Resetting password

To reset password of a user, run the following command. An encrypted/hashed password will be displayed in the console. Copy it, and update the ```passwordHash``` key of the desired user with it in ```CloudCall_User``` using admin console. **Please note that, the value of this password will be same as the username. Users should reset their password on first login for security purpose.**

```bash
node utilities/password_hash.js username
```
Example output (not real values):
```
Username: username
Encrypted Password: Sddvhdb$15$caskuhcdvalmadk765dkjfdbjsdvhy7asbadbhgdkvbb
```

## 5. FAQ
### 5.1 Database

Following tables will be created in DynamoDB automatically and on-demand  while application is running.

```bash
Table 1: Cloudcall_Campaign_Table
PK: campaignName
Description: Status, ID and description is stored in this table.


Table 2: Cloudcall_Agent_Table
PK: agentName
Description: Here, all provisioned agents and their campaign mapping will be stored.

Table 3: Cloudcall_Phone_Number_Table
PK: phoneNumber
Description: Phone/Dial numbers used in different campaigns are stored here.

Table 4: CloudCall_CDR
PK: ContactID
Description: All call data records (CDR) will be stored in this table for reporting purpose.

Table 5: CloudCall_User
PK: username
Description: This table stores users and their login credentials.
```

### 5.2 Application runtime logs

To examine logs, following command can be used - 
```bash
npm run pm-loc-logs
```
The location of log file is ```awsconnectdashboard/logs/logs.txt```, which can also be read from termiinal using ```tail``` or ```cat``` commands.














-----------------------------




