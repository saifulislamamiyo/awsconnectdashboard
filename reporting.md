Summary Report

1. Agent wise
   - Agent name
   - Campaign name
   - total calls
   - total talk time
   - avg talk time
2. Campaign wise
   - Inbound Group
   - Inbound Group Name
   - Calls : total incoming calls
   - Connects : Total incoming calls - Abandoned calls
   - Disconnect: Abandoned calls
   - Disconnect Rate: Calculated as a percentage of Calls
   - Talk : total talk time. handling time = `end_time` - `start_time`
   - Average Talk
   - Wait time: total time calls waited in queue for this campaign
   - Average wait
   - Longest wait

start_time + queue_time + agent_talk_time + wrap_up_time
CDR:
(initial data)

- Contact ID
- start_time
- call_direction: INBOUND/OUTBOUND
- ani (customer number for inbound, connect ph number for outbound)
- dnis (connect ph number for inbound, customer number for outbound)
- campaign_name
- is_checked (a boolean)

2. Campaign wise

- Inbound Group = Inbound Dialed Number
- Inbound Group Name = text description of the inbound number
- Calls - total calls received on this number (but filtered - more later)
- Connects - calls put into queue - these are calls that are answered by an agent
- Sales - not required
- Conversion - not reqd
- Drop / Drop Rate - not requried
- Disconnect = Abandoned Calls (I,e calls that are placed in queue but are not answered by an agent)
- Disconnect Rate - calculated as a percentage of Calls
- After Hours - not reqd
- Talk - sum of total call duration for this number
- average Talk - calculated based on Talk divided by Calls as an average time
- Wait - Total time calls are in queue for this number
- Average Wait - calculated based on Wait divided by Calls as an average time
- Longest Wait - longest wait time in queue for this number

---

AGENT DASHBOARD

The relevant items here are:

- Talk-time cumulative total of call durations since midnight for that particular Agent
- Wait Time - Total time in queue for all calls for that agent (from midnight) -- Not required
- Wrap Time - Total after call work for that agent since midnight
  \*\* - Pause time - Total cumulative time agent was not in an Available state since midnight
- Calls - Total call count of received calls for that agent today - Can we have this split between inbound and outbound calls

---

They would also like the Call History tab, that lists all calls received by that Agent today
to include

- Date/Time
- Inbound Number/Dialed Number
- Inbound/outbound call indicator
- Inbound Number called/Inbound number name
- Call duration
- Disposition (tbc)
