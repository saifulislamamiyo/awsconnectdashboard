

Summary Report

1. Agent wise
   - Agent name
   - Campaign name
   - total calls
   - total talk time
   - avg talk time


   2. Campaign wise
      - Inbound Group (tollFreeNumber)
      - Inbound Group Name (campaignName)
      - Calls : total incoming calls
[s]      - Connects : Total incoming calls - Abandoned calls
      - Disconnect: Abandoned calls (EnqueueTimestamp available, but ConnectedToAgentTimestamp unavailable)
[s]      - Disconnect Rate: Calculated as a percentage of Calls
      - Talk : total talk time. handling time = `end_time` - `start_time`
[s]   - Average Talk
      - Wait time: total time calls waited in queue for this campaign (ConnectedToAgentTimestamp - EnqueueTimestamp)
[s]      - Average wait
[s]      - Longest wait

## // start_time + queue_time + agent_talk_time + wrap_up_time
CDR:
(initial data)

- Contact ID
- start_time
- call_direction: INBOUND/OUTBOUND
- ani (customer number for inbound, connect ph number for outbound)
- dnis (connect ph number for inbound, customer number for outbound)
- campaign_name
- tollFreeNumber
- phoneNumDescription


---

AGENT DASHBOARD

The relevant items here are:

- Talk-time cumulative total of call durations since midnight for that particular Agent
- Wait Time - Total time in queue for all calls for that agent (from midnight) -- Not required
- Wrap Time - Total after call work for that agent since midnight
- Calls - Total call count of received calls for that agent today - Can we have this split between inbound and outbound calls



Call Detais: (Agent filter = AgentName is Hardcoded)
------------------
21- Jan- 2023

Date Time (Human Readable) (Sorted by)
Customer Number
Call Direction
Campaign Name (NA if OUTBOUD)
Campaign Hotline  (DO)
Talk Time
Wrap Time





--
Showing report of <human date>
--

XXXX - baad  apatoto - Pause time - Total cumulative time agent was not in an Available state since midnight (OCCUPANCY of GetMetricData)
---

They would also like the Call History tab, that lists all calls received by that Agent today
to include

-----------




Abol Tablo baad -

- Date/Time
- Inbound Number/Dialed Number
- Inbound/outbound call indicator
- Inbound Number called/Inbound number name
- Call duration
- Disposition (tbc)
