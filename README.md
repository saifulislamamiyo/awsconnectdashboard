## awsconnectdashboard

# Campaign control Dashboard for AWS Connect

## Setup:


### App:
```
git clone <repo>
cd <repo-dir>
npm install
mv dot-env-template .env
# set variables in .env except DEFAULT_OUTBOUND_QUEUE_ID
nano .env
# Run the following to get DEFAULT_OUTBOUND_QUEUE_ID 
node utilities/listqueues.js 
# set DEFAULT_OUTBOUND_QUEUE_ID of .env
nano .env

```

### Db:
```
Table 1: Cloudcall_Campaign_Table
PK: campaignName

Table 2: Cloudcall_Agent_Table
PK: agentName

Table 3: Cloudcall_Phone_Number_Table
PK: phoneNumber
```

```
# initiate Cloudcall_Campaign_Table
node utilities/initdb.js
```



## Run/Stop/Restart:


By npm script:

```
npm run pm-start
npm run pm-stop 
```
_* A process named `ccconfigpanel` will be created._

```
pm2 restart ccconfigpanel
pm2 reload ccconfigpanel
pm2 stop ccconfigpanel   # same as: npm run pm-stop
pm2 delete ccconfigpanel
```

## Monitor:

```
pm2 list
pm2 logs
pm2 monit # terminal dashboard

```

## Log Rotation by PM2

```
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 1K    # 20G, 15M, 1K etc
pm2 set pm2-logrotate:rotateInterval '*/1 * * * *'

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
