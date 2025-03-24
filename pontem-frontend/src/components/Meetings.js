import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Meetings() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    axios.get('/api/meetings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(response => {
      setMeetings(response.data);
    }).catch(error => {
      console.error(error);
    });
  }, []);

  return (
    <div>
      <h1>Meetings</h1>
      <ul>
        {meetings.map(meeting => (
          <li key={meeting.id}>{meeting.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Meetings;